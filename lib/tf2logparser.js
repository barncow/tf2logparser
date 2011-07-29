var fs = require("fs")
  , parsingUtils = require('./parsingutils')
  , weaponList = require('./weaponlist')
  , roleList = require('./rolelist')
  , readFile = require('./readfile')
  , log = require('./log')
  , sys = require('sys');

/**
  This object is used to parse a file, or a series of TF2 Log lines.
*/
function TF2LogParser() {
  /**
    This will hold the accumulated data.
  */
  var _log = log.create();

  /**
    This will hold all variables needed to maintain state, but don't really belong in the final object.
  */
  var _state = {
    hasGameStarted: false, //whether or not we have encountered our first "round_start"
    hasGameEnded: false, //whether or not we have encountered a "game_over"
    isHumiliation: false,
    previousTimestamp: null,
    previousLogLine: null,
    playableTimestampBoundaries: [],
    joinedTeam: {
      players: {},
      count: 0
    },
    roundWinTeam: false,
    prevTeamRedScore: 0,
    prevTeamBlueScore: 0
  };

  /**
    This is a convenience function to determine if we need to skip lines or not.
  */
  var shouldIgnoreLine = function() {
    return !_state.hasGameStarted || _state.hasGameEnded || _state.isHumiliation;
  };

  /**
    Holds configuration options.
  */
  this.config = {
    /**
      When set to true, ignore any lines that haven't been explicitly dealt with.
    */
    ignoreUnrecognizedLines: true,

    /**
      When set to true, this will ignore any line with a bot.
    */
    ignoreBots: true
  }

  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log.getLog();
  };

  /**
    Parses a log file from disk.
    @param filePath file path to the file to process.
    @param callbackWhenDone optional callback to be used when all lines have been processed.
      The callback will be passed (err, log) - err is any error that ocurred, and log being the log object that was generated.
  */
  this.parseLogFile = function(filePath, callbackWhenDone) {
    var cb = false,
    self = this;

    cb = function(err) {
		self.finishLog();
		if(callbackWhenDone) {
			callbackWhenDone(err, self.getLog());
		}
    }

    readFile(filePath, this.parseLine, cb, self);
  };

  /**
    Does any final cleanup work, such as time calculations.
    Note - when calling parseLine manually (ie. live log feeds) make sure to call this function when done with the game.
  */
  this.finishLog = function() {
    _log.setGameTimestamp('gameEnd', _state.previousTimestamp);
    _state.playableTimestampBoundaries.push({end: _state.previousTimestamp});
    _log.setElapsedSeconds(parsingUtils.getTimestampDifference(_state.previousTimestamp, _log.getLog().gameStartTimestamp));
    _log.setPlayableSeconds(this._getPlayableSeconds());
    _log.pruneNotInMatch();
  };

  /**
    Uses the recorded boundaries to calculate the actual seconds of play.
    Generally not needed outside this class, but it is exposed for testing.
    @param boundaries overrides the object's generated boundaries for calculation. Use only for testing.
  */
  this._getPlayableSeconds = function(boundaries) {
    if(!boundaries) boundaries = _state.playableTimestampBoundaries;
    //when processing the log, certain breakpoints where added. Need to add up timestamp differences between start and end timestamps.
    //timestamps can be repeated for start and end, just take the difference between first start and first end.
    var playableSeconds = 0, start = null, end = null;

    for(var i in boundaries) {
      var b = boundaries[i];
      if(!start && b['start'] !== undefined) start = b['start'];
      else if(start && !end && b['end'] !== undefined) end = b['end'];
      else if(start && end && b['start'] !== undefined) {
        playableSeconds += parsingUtils.getTimestampDifference(end, start);
        start = b['start'];
        end = null;
      }
    }

    if(start && end) playableSeconds += parsingUtils.getTimestampDifference(end, start);

    return playableSeconds;
  };

  /**
    Parses a single line from a log. This is where most of the work will be done.
    Note - when calling this manually (ie. live log feeds) make sure to call finishLog when done with the game.
  */
  this.parseLine = function(logLine) {
    var timestamp = parsingUtils.getTimestamp(logLine), self = this;
    if(!timestamp) return;

    /**
      Function to properly modify stats and appending last events in the event a medic_death occurs, since this can occur in multiple places.
      @param logLineDetails string of the logLineDetails to parse from a medic_death line
    */
    function processMedicDeath(logLineDetails) {
      var players = parsingUtils.getPlayers(logLineDetails, self.config.ignoreBots), attacker = players[0], victim = players[1];
      var healing = parsingUtils.getHealing(logLineDetails), ubercharge = parsingUtils.didMedicDieWithUber(logLineDetails);
      if(healing === false) return;//corrupt line - using triple equals since it could have 0 healing which is falsey

      //must be a suicide if the killer == victim, don't want to increment medPicks during a suicide
      var isSuicide = (attacker.steamid === victim.steamid);

      if(ubercharge) {
        _log.incrementStatToPlayer(victim.steamid, 'droppedUbers');
        if(!isSuicide) _log.incrementStatToPlayer(attacker.steamid, 'medPicksDroppedUber');
      }
      _log.incrementStatToPlayer(victim.steamid, 'healing', false, healing);
      if(!isSuicide) _log.incrementStatToPlayer(attacker.steamid, 'medPicksTotal');
      _log.appendLastEvent({healing: healing, ubercharge: ubercharge});
    }

    //doing a self-executing anonymous function here
    //so that we can do some post actions after parseLine is complete,
    //due to the way that we are returning out of the function in different
    //places each time.
    (function(){
      var logLineDetails = parsingUtils.getLogLineDetails(logLine), players = null, playerLineAction = null, team = null, teamAction = null;

        if(!logLineDetails) return; //corrupt line

        //the idea here is that when a line is recognized and dealt with as necessary, that this function would return
        //before an error could be thrown at the end. When done, return!
        //also, try to prioritize the checks by estimated frequency of occurrence.

        //DOING LINES THAT SHOULD BE PROCESSED REGARDLESS OF IGNORING LINES
        if(parsingUtils.isLogLineOfType(logLineDetails, '"')) {
          //players need to be added and updated regardless of whether they should be ignored or not.
          players = parsingUtils.getPlayers(logLineDetails, self.config.ignoreBots);
          if(!players) return; //corrupt line

          //make sure that the players in this line have been added to our log object
          for(var p in players) {
            _log.addUpdatePlayer(players[p], _state.hasGameStarted);
          }

          playerLineAction = parsingUtils.getPlayerLineAction(logLineDetails);
          if(!playerLineAction) return; //corrupt line

          if(playerLineAction == 'joined team' && _state.hasGameStarted) {
            players[0].team = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            _log.addUpdatePlayer(players[0], _state.hasGameStarted);

            //if this player has not invoked joined team yet, add to joinedTeam.count
            if(_state.joinedTeam.players[players[0].steamid] === undefined) {
              ++_state.joinedTeam.count;
              _state.joinedTeam.players[players[0].steamid] = true;
            }

            if(_state.joinedTeam.count >= _log.getPlayerCount()) {
              //teams have switched
              _log.switchScores();
              _state.joinedTeam.count = 0;
              _state.joinedTeam.players = {};

              //switch state scores
              var blueScore = _state.prevTeamBlueScore;
            _state.prevTeamBlueScore = _state.prevTeamRedScore;
            _state.prevTeamRedScore = blueScore;
            }

            return;
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'World triggered')) {
          var worldTriggerAction = parsingUtils.getWorldTriggerAction(logLineDetails);
          if(!worldTriggerAction) return; //corrupt line

          if(worldTriggerAction == 'Round_Start') {
            _state.isHumiliation = false;
            if(!_state.hasGameStarted) {
              _state.hasGameStarted = true;
              _log.setGameTimestamp('gameStart', timestamp);
            }

            _state.playableTimestampBoundaries.push({start: timestamp});
            return;
          } else if(worldTriggerAction == 'Round_Setup_Begin'
            || worldTriggerAction == 'Round_Overtime'
            || worldTriggerAction == 'Round_Length' //it is better to compare timestamps between round_start and round_win to get the round length.
            || worldTriggerAction == 'Mini_Round_Selected'
            || worldTriggerAction == 'Mini_Round_Start'
            || worldTriggerAction == 'Mini_Round_Win'
            || worldTriggerAction == 'Mini_Round_Length' //it is better to compare timestamps between round_start and round_win to get the round length.
            || worldTriggerAction == 'Round_Setup_End') {
            return; //ignoring these lines
          } else if(worldTriggerAction == 'Game_Paused') {
            _state.playableTimestampBoundaries.push({end: timestamp});
            return;
          } else if(worldTriggerAction == 'Game_Unpaused') {
            _state.playableTimestampBoundaries.push({start: timestamp});
            return;
          } else if(worldTriggerAction == 'Game_Over') {
            _log.setGameTimestamp('gameEnd', timestamp);
            _state.playableTimestampBoundaries.push({end: timestamp});
            return;
          }
        } else if(parsingUtils.getMap(logLineDetails)) {
          _log.getLog().mapName = parsingUtils.getMap(logLineDetails);
          return;
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Team')) {
          team = parsingUtils.getTeamFromTeamLine(logLineDetails), teamAction = parsingUtils.getTeamAction(logLineDetails);
          if(!team || !teamAction) return; //corrupt line

          if(teamAction == 'current score' || teamAction == 'final score') {
            if(_log.getMapType() == 'ctf') return; //not concerned about this line from ctf
            var score = parsingUtils.getTeamScore(logLineDetails), incRoundWinScore = false;

            if(score === false) return; //corrupt line

            //if any score has changed, we know it is legit (not a round cut short with a "winner" picked)
            if(team == 'Red') {
              if(score != _state.prevTeamRedScore && _state.roundWinTeam) {
                //score has changed, round_win is legit
                incRoundWinScore = true;
              }
              _state.prevTeamRedScore = score;
            } else if(team == 'Blue') {
              if(score != _state.prevTeamBlueScore && _state.roundWinTeam) {
                //score has changed, round_win is legit
                incRoundWinScore = true;
              }
              _state.prevTeamBlueScore = score;
            }

            if(incRoundWinScore) {
              _log.incrementScoreForTeam(_state.roundWinTeam);
              _state.roundWinTeam = false;
            }
            return;
          }
        }

        //if we need to ignore lines, let's exit here.
        if(shouldIgnoreLine()) return;

        if(parsingUtils.isLogLineOfType(logLineDetails, '"')) {
          //THIS IS A LINE INVOLVING A PLAYER

          if(playerLineAction == 'position_report') {
            var position = parsingUtils.getReportedPosition(logLineDetails);
            if(!position) return; //corrupt line
            _log.setPlayerPosition(players[0].steamid, position);
            _log.addPositionEvent(timestamp, players[0], position);
            return;
          } else if(playerLineAction == 'say' || playerLineAction == 'say_team') {
            var text = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            if(text.charAt(0) == '!' || text.charAt(0) == '/') return; //if the say starts with !, assume its a sourcemod command. Do nothing with it. See also ParsingUtils#scrubLogLine.

            if(playerLineAction == 'say') _log.addSayEvent(timestamp, players[0], text);
            else {
              _log.addSayTeamEvent(timestamp, players[0], text);
            }
            return;
          } else if(playerLineAction == 'changed role to') {
            var role = roleList.findRole(parsingUtils.getPlayerLineActionDetail(logLineDetails));
            if(!role) return; //corrupt line
            _log.addUpdateRoleToPlayer(players[0].steamid, role, timestamp);
            return;
          } else if(playerLineAction == 'disconnected') {
            //do not remove the player from the log. The player was in the server, they need to be in the log.
            _log.addUpdatePlayer(players[0], _state.hasGameStarted, false);
            _log.setPlayerPosition(players[0].steamid, {}); //no longer in server, should not have position
            return;
          } else if(playerLineAction == 'killed') {
            var attacker = players[0],
              victim = players[1],
              attackerCoord = parsingUtils.getKillCoords(logLineDetails, 'attacker'),
              victimCoord = parsingUtils.getKillCoords(logLineDetails, 'victim'),
              customkill = parsingUtils.getCustomKill(logLineDetails),
              weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails), customkill);

            //don't check customkill, not always present.
            if(!attacker || !victim || !attackerCoord, !victimCoord || !weapon) return; //corrupt line

            //always add role to player
            _log.addUpdateRoleToPlayer(attacker.steamid, roleList.findRole(weapon.role), timestamp);

            _log.setPlayerPosition(attacker.steamid, attackerCoord);
            _log.setPlayerPosition(victim.steamid, victimCoord);
            attacker.position = attackerCoord;
            victim.position = victimCoord;

            _log.addKillEvent(timestamp, attacker, victim, weapon.key, customkill);

            if(_state.medic_death) {
              processMedicDeath(_state.medic_death);
              delete _state.medic_death;
            }

            if(customkill == 'feign_death') return; //ignore dead-ringer spy deaths
            _log.incrementStatToPlayer(attacker.steamid, 'kills', customkill);
            _log.incrementStatToPlayer(victim.steamid, 'deaths');
            _log.incrementWeaponSpreadToPlayer(attacker.steamid, weapon.key, 'kills');
            _log.incrementWeaponSpreadToPlayer(victim.steamid, weapon.key, 'deaths');
            _log.addWeapon(weapon.key);
            _log.incrementPlayerSpreadToPlayer(attacker.steamid, victim, 'kills');
            _log.incrementPlayerSpreadToPlayer(victim.steamid, attacker, 'deaths');
            return;
          } else if(playerLineAction == 'committed suicide with') {
            var weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails)),
            attackerCoord = parsingUtils.getKillCoords(logLineDetails, 'attacker');

            if(!weapon || !attackerCoord) return; //corrupt line

            _log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role), timestamp);

            _log.setPlayerPosition(players[0].steamid, attackerCoord);
            players[0].position = attackerCoord;

            _log.addKillEvent(timestamp, players[0], players[0], weapon.key, 'suicide');
            _log.incrementWeaponSpreadToPlayer(players[0].steamid, weapon.key, 'deaths');
            _log.addWeapon(weapon.key);
            _log.incrementStatToPlayer(players[0].steamid, 'deaths');
            _log.incrementPlayerSpreadToPlayer(players[0].steamid, players[0], 'deaths');

            if(_state.medic_death) {
              processMedicDeath(_state.medic_death);
              delete _state.medic_death;
            }
            return;
          } else if(playerLineAction == 'picked up item') {
              var item = parsingUtils.getPickedUpItemKeyName(logLineDetails);
              if(!item) return; //corrupt line

              _log.incrementItemSpreadToPlayer(players[0].steamid, item);
              return;
          } else if(playerLineAction == 'triggered') {
            var trigger = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            if(trigger == 'kill assist') {
              //check if the kill line previous to this line was the result of dead ringer spies.
              //If so, do not increment assists.
              var prevLogLineDetails = parsingUtils.getLogLineDetails(_state.previousLogLine),
                position = parsingUtils.getKillCoords(logLineDetails, 'assister');

              if(!position) return; //corrupt line

              _log.setPlayerPosition(players[0].steamid, position);
              players[0].position = position;
              _log.addAssistToLastEvent(timestamp, players[0]);

              if(parsingUtils.isLogLineOfType(prevLogLineDetails, '"')
                && parsingUtils.getPlayerLineAction(prevLogLineDetails) == 'killed'
                && parsingUtils.getCustomKill(prevLogLineDetails) == 'feign_death') {
                  return;
              }

              _log.incrementStatToPlayer(players[0].steamid, 'assists');
              return;
            } else if(trigger == 'domination') {
              _log.incrementStatToPlayer(players[0].steamid, 'dominations');
              _log.incrementStatToPlayer(players[1].steamid, 'timesDominated');
              _log.addDominationEvent(timestamp, players[0], players[1]);
              return;
            } else if(trigger == 'revenge') {
              _log.incrementStatToPlayer(players[0].steamid, 'revenges');
              _log.addRevengeEvent(timestamp, players[0], players[1]);
              return;
            } else if(trigger == 'builtobject') {
              var object = parsingUtils.getObjectFromBuiltObject(logLineDetails), position = parsingUtils.getReportedPosition(logLineDetails);
              if(!object || !position) return; //corrupt line

              _log.setPlayerPosition(players[0].steamid, position);
              players[0].position = position;

              if(object == 'OBJ_ATTACHMENT_SAPPER') {
                _log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('spy'), timestamp);
              } else {
                _log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('engineer'), timestamp);
              }

              _log.addBuildEvent(timestamp, players[0], object);
              return;
            } else if(trigger == 'killedobject') {
              //_log.addKillEvent(timestamp, players[0], players[1], parsingUtils.getWeapon(logLineDetails), parsingUtils.getObjectFromBuiltObject(logLineDetails));
              return;
            } else if(trigger == 'player_extinguished') {
              var weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails)),
              attackerCoord = parsingUtils.getKillCoords(logLineDetails, 'attacker'),
              victimCoord = parsingUtils.getKillCoords(logLineDetails, 'victim');

              if(!weapon || !attackerCoord || !victimCoord) return; //corrupt line

              _log.setPlayerPosition(players[0].steamid, attackerCoord);
              players[0].position = attackerCoord;
              _log.setPlayerPosition(players[1].steamid, victimCoord);
              players[1].position = victimCoord;

              _log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role), timestamp);
              _log.addExtinguishEvent(timestamp, players[0], players[1], weapon.key);
              _log.incrementStatToPlayer(players[0].steamid, 'extinguishes');
              return;
            } else if(trigger == 'chargedeployed') {
              _log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('medic'), timestamp);
              _log.addUberchargeEvent(timestamp, players[0]);
              _log.incrementStatToPlayer(players[0].steamid, 'ubers');
              return;
            } else if(trigger == 'medic_death') {
              var attacker = players[0], victim = players[1];
              _log.addUpdateRoleToPlayer(victim.steamid, roleList.findRole('medic'), timestamp);

              //medic_death will always surround the kill/suicide either before or after. If not before, store the medic death for later.
              if(!_log.doesLastEventMatchPlayers(attacker.steamid, victim.steamid)) {
                _state.medic_death = logLineDetails;
                return;
              }

              processMedicDeath(logLineDetails);
              return;
            } else if(trigger == 'damage') {
              _log.incrementStatToPlayer(players[0].steamid, 'damage', false, parsingUtils.getDamage(logLineDetails));
              return;
            } else if(trigger == 'healed') {
              //don't add role here, engineers and medics both register heals
              var healer = players[0], patient = players[1], healing = parsingUtils.getHealing(logLineDetails);

              //don't check patient, some plugins will record a general heal statement.
              if(!healing) return; //corrupt line

              _log.incrementHealSpreadToPlayer(healer.steamid, patient, healing);
              if(!patient) _log.incrementStatToPlayer(healer.steamid, 'healing', false, healing);
              return;
            } else if(trigger == 'captureblocked') {
              var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
                , cpname = parsingUtils.getCapturePointName(logLineDetails);
              if(!position || !cpname) return; //corrupt line

              _log.incrementStatToPlayer(players[0].steamid, 'pointCaptureBlocks');
              _log.setPlayerPosition(players[0].steamid, position);
              players[0].position = position;
              _log.addCaptureBlockedEvent(timestamp, players[0], cpname);
              return;
            } else if(trigger == 'flagevent') {
              if(_log.getMapType() != 'ctf') {
                _log.setMapType('ctf');
                _log.resetScores(); //need to erase any fomer round_wins
              }

              var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
                , event = parsingUtils.getFlagEvent(logLineDetails);
              if(!position || !event) return; //corrupt line

              players[0].position = position;
              _log.setPlayerPosition(players[0].steamid, position);

              if(event == 'defended') {
                _log.incrementStatToPlayer(players[0].steamid, 'flagDefends');
                _log.addFlagDefendedEvent(timestamp, players[0]);
                return;
              } else if(event == 'captured') {
                _log.incrementStatToPlayer(players[0].steamid, 'flagCaptures');
                _log.incrementScoreForTeam(players[0].team);
                _log.addFlagCapturedEvent(timestamp, players[0]);
                return;
              } else if(event == 'picked up') {
                _log.addFlagPickedUpEvent(timestamp, players[0]);
                return;
              } else if(event == 'dropped') {
                _log.addFlagDroppedEvent(timestamp, players[0]);
                return;
              }
            }
          } else if(playerLineAction == 'entered the game') {
            _log.setPlayerJoinedGame(players[0].steamid, timestamp);
            return;
          } else if(playerLineAction == 'connected, address' || playerLineAction == 'STEAM USERID validated' || playerLineAction == 'changed name to') {
              return; //do nothing
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Team')) {
          if(teamAction == 'triggered') {
            var teamTriggerAction = parsingUtils.getTeamTriggerAction(logLineDetails);

            if(!teamTriggerAction) return; //corrupt line

            if(teamTriggerAction == 'pointcaptured') {
              var cpname = parsingUtils.getCapturePointName(logLineDetails)
                players = parsingUtils.getPlayers(logLineDetails, self.config.ignoreBots);

              if(!cpname || !players) return; //corrupt line

              //make sure that the players in this line have been added to our log object
              for(var p in players) {
                _log.addUpdatePlayer(players[p], _state.hasGameStarted);

                //increment each player's point captures stats
                _log.incrementStatToPlayer(players[p].steamid, 'pointCaptures');

                //add position to players
                var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'+(parseInt(p, 10)+1)));
                if(!position) return; //corrupt line
                _log.setPlayerPosition(players[p].steamid, position);
                players[p].position = position;
              }

              _log.addPointCapturedEvent(timestamp, team, cpname, players);
              return;
            } else if (teamTriggerAction == 'Intermission_Win_Limit') {
              return; //do nothing
            }
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'World triggered')) {
          var worldTriggerAction = parsingUtils.getWorldTriggerAction(logLineDetails);
          if(!worldTriggerAction) return; //corrupt line

          if(worldTriggerAction == 'Round_Win') {
            var team = parsingUtils.getRoundWinTeam(logLineDetails);
            if(!team) return; //corrupt line

            if(_log.getMapType() != 'ctf') _state.roundWinTeam = team;

            _state.playableTimestampBoundaries.push({end: timestamp});
            _state.isHumiliation = true;
            return;
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Log file started')
          || parsingUtils.isLogLineOfType(logLineDetails, 'server_cvar:')
          || parsingUtils.isLogLineOfType(logLineDetails, 'rcon from') //See also ParsingUtils#scrubLogLine.
          || parsingUtils.isLogLineOfType(logLineDetails, 'Log file closed')
          ) {
          return; //ignoring these lines.
        }

        //still here, must not have recognized the line.
        if(!self.config.ignoreUnrecognizedLines) throw new Error("Did not process line: "+logLine);
      })(); //end anon self-exe fxn

      _state.previousTimestamp = timestamp;
      _state.previousLogLine = logLine;
      _log.updateRoleSecondsPlayedForAllPlayers(timestamp);
  };
}

/**
  Exposing create method to prevent issues with not calling new (ie. assigning to global obj)
*/
module.exports.create = function() {
  return new TF2LogParser();
}

/**
  Exposing class definition for users to inherit from.
*/
module.exports._class = TF2LogParser;

