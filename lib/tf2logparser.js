var fs = require("fs")
  , parsingUtils = require('./parsingutils')
  , weaponList = require('./weaponlist')
  , roleList = require('./rolelist')
  , ReadFile = require('./readfile')
  , Log = require('./log')
  , events = require('events')
  , util = require('util');

/**
  This object is used to parse a file, or a series of TF2 Log lines.
*/
var TF2LogParser = function TF2LogParser() {
  if(!(this instanceof TF2LogParser)) return new TF2LogParser(); //protection from not using "new"

  //call EventEmitter Constructor
  events.EventEmitter.call(this);

  /**
    This will hold the accumulated data.
  */
  this._log = new Log();

  /**
    This will hold all variables needed to maintain state, but don't really belong in the final object.
  */
  this._state = {
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
}

//inherit from EventEmitter
util.inherits(TF2LogParser, events.EventEmitter);

/**
  This is a convenience function to determine if we need to skip lines or not.
*/
TF2LogParser.prototype.shouldIgnoreLine = function() {
  return !this._state.hasGameStarted || this._state.hasGameEnded || this._state.isHumiliation;
};

/**
  Convenience function for getting the actual log data.
*/
TF2LogParser.prototype.getLogData = function() {
  if(!this._log) return null;
  else return this._log.getLog();
};

/**
  Parses a log file from disk.
  The 'line' event is emitted for each line, in order.
  The 'done' event is emitted when the file is completely read.
  The 'error' event is emitted when an error either in a callback or a system error ocurrs.
  @param filePath file path to the file to process.
*/
TF2LogParser.prototype.parseLogFile = function(filePath) {
  var self = this
  , readFile = new ReadFile();

  readFile.on('line', function(line){
    self.parseLine(line);
    self.emit('line', line);
  });

  readFile.on('done', function(){
    self.finishLog();
    self.emit('done', self._log.getLog());
  });

  readFile.on('error', function(err) {
    self.finishLog();
    self.emit('error', err);
  });

  readFile.readFile(filePath);
};

/**
  Does any final cleanup work, such as time calculations.
  Note - when calling parseLine manually (ie. live log feeds) make sure to call this function when done with the game.
*/
TF2LogParser.prototype.finishLog = function() {
  this._log.setGameTimestamp('gameEnd', this._state.previousTimestamp);
  this._state.playableTimestampBoundaries.push({end: this._state.previousTimestamp});
  this._log.setElapsedSeconds(parsingUtils.getTimestampDifference(this._state.previousTimestamp, this._log.getLog().gameStartTimestamp));
  this._log.setPlayableSeconds(this._getPlayableSeconds());
  this._log.pruneNotInMatch();
};

/**
  Uses the recorded boundaries to calculate the actual seconds of play.
  Generally not needed outside this class, but it is exposed for testing.
  @param boundaries overrides the object's generated boundaries for calculation. Use only for testing.
*/
TF2LogParser.prototype._getPlayableSeconds = function(boundaries) {
  if(!boundaries) boundaries = this._state.playableTimestampBoundaries;
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
TF2LogParser.prototype.parseLine = function(logLine) {
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
      self._log.incrementStatToPlayer(victim.steamid, 'droppedUbers');
      if(!isSuicide) self._log.incrementStatToPlayer(attacker.steamid, 'medPicksDroppedUber');
    }
    self._log.incrementStatToPlayer(victim.steamid, 'healing', false, healing);
    if(!isSuicide) self._log.incrementStatToPlayer(attacker.steamid, 'medPicksTotal');
    self._log.appendLastEvent({healing: healing, ubercharge: ubercharge});
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
          this._log.addUpdatePlayer(players[p], this._state.hasGameStarted);
        }

        playerLineAction = parsingUtils.getPlayerLineAction(logLineDetails);
        if(!playerLineAction) return; //corrupt line

        if(playerLineAction == 'joined team' && this._state.hasGameStarted) {
          players[0].team = parsingUtils.getPlayerLineActionDetail(logLineDetails);
          this._log.addUpdatePlayer(players[0], this._state.hasGameStarted);

          //if this player has not invoked joined team yet, add to joinedTeam.count
          if(this._state.joinedTeam.players[players[0].steamid] === undefined) {
            ++this._state.joinedTeam.count;
            this._state.joinedTeam.players[players[0].steamid] = true;
          }

          if(this._state.joinedTeam.count >= this._log.getPlayerCount()) {
            //teams have switched
            this._log.switchScores();
            this._state.joinedTeam.count = 0;
            this._state.joinedTeam.players = {};

            //switch state scores
            var blueScore = this._state.prevTeamBlueScore;
          this._state.prevTeamBlueScore = this._state.prevTeamRedScore;
          this._state.prevTeamRedScore = blueScore;
          }

          return;
        }
      } else if(parsingUtils.isLogLineOfType(logLineDetails, 'World triggered')) {
        var worldTriggerAction = parsingUtils.getWorldTriggerAction(logLineDetails);
        if(!worldTriggerAction) return; //corrupt line

        if(worldTriggerAction == 'Round_Start') {
          this._state.isHumiliation = false;
          if(!this._state.hasGameStarted) {
            this._state.hasGameStarted = true;
            this._log.setGameTimestamp('gameStart', timestamp);
          }

          this._state.playableTimestampBoundaries.push({start: timestamp});
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
          this._state.playableTimestampBoundaries.push({end: timestamp});
          return;
        } else if(worldTriggerAction == 'Game_Unpaused') {
          this._state.playableTimestampBoundaries.push({start: timestamp});
          return;
        } else if(worldTriggerAction == 'Game_Over') {
          this._log.setGameTimestamp('gameEnd', timestamp);
          this._state.playableTimestampBoundaries.push({end: timestamp});
          return;
        }
      } else if(parsingUtils.getMap(logLineDetails)) {
        this._log.getLog().mapName = parsingUtils.getMap(logLineDetails);
        return;
      } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Team')) {
        team = parsingUtils.getTeamFromTeamLine(logLineDetails), teamAction = parsingUtils.getTeamAction(logLineDetails);
        if(!team || !teamAction) return; //corrupt line

        if(teamAction == 'current score' || teamAction == 'final score') {
          if(this._log.getMapType() == 'ctf') return; //not concerned about this line from ctf
          var score = parsingUtils.getTeamScore(logLineDetails), incRoundWinScore = false;

          if(score === false) return; //corrupt line

          //if any score has changed, we know it is legit (not a round cut short with a "winner" picked)
          if(team == 'Red') {
            if(score != this._state.prevTeamRedScore && this._state.roundWinTeam) {
              //score has changed, round_win is legit
              incRoundWinScore = true;
            }
            this._state.prevTeamRedScore = score;
          } else if(team == 'Blue') {
            if(score != this._state.prevTeamBlueScore && this._state.roundWinTeam) {
              //score has changed, round_win is legit
              incRoundWinScore = true;
            }
            this._state.prevTeamBlueScore = score;
          }

          if(incRoundWinScore) {
            this._log.incrementScoreForTeam(this._state.roundWinTeam);
            this._state.roundWinTeam = false;
          }
          return;
        }
      }

      //if we need to ignore lines, let's exit here.
      if(this.shouldIgnoreLine()) return;

      if(parsingUtils.isLogLineOfType(logLineDetails, '"')) {
        //THIS IS A LINE INVOLVING A PLAYER

        if(playerLineAction == 'position_report') {
          var position = parsingUtils.getReportedPosition(logLineDetails);
          if(!position) return; //corrupt line
          this._log.setPlayerPosition(players[0].steamid, position);
          this._log.addPositionEvent(timestamp, players[0], position);
          return;
        } else if(playerLineAction == 'say' || playerLineAction == 'say_team') {
          var text = parsingUtils.getPlayerLineActionDetail(logLineDetails);
          if(text.charAt(0) == '!' || text.charAt(0) == '/') return; //if the say starts with !, assume its a sourcemod command. Do nothing with it. See also ParsingUtils#scrubLogLine.

          if(playerLineAction == 'say') this._log.addSayEvent(timestamp, players[0], text);
          else {
            this._log.addSayTeamEvent(timestamp, players[0], text);
          }
          return;
        } else if(playerLineAction == 'changed role to') {
          var role = roleList.findRole(parsingUtils.getPlayerLineActionDetail(logLineDetails));
          if(!role) return; //corrupt line
          this._log.addUpdateRoleToPlayer(players[0].steamid, role, timestamp);
          return;
        } else if(playerLineAction == 'disconnected') {
          //do not remove the player from the log. The player was in the server, they need to be in the log.
          this._log.addUpdatePlayer(players[0], this._state.hasGameStarted, false);
          this._log.setPlayerPosition(players[0].steamid, {}); //no longer in server, should not have position
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
          this._log.addUpdateRoleToPlayer(attacker.steamid, roleList.findRole(weapon.role), timestamp);

          this._log.setPlayerPosition(attacker.steamid, attackerCoord);
          this._log.setPlayerPosition(victim.steamid, victimCoord);
          attacker.position = attackerCoord;
          victim.position = victimCoord;

          this._log.addKillEvent(timestamp, attacker, victim, weapon.key, customkill);

          if(this._state.medic_death) {
            processMedicDeath(this._state.medic_death);
            delete this._state.medic_death;
          }

          if(customkill == 'feign_death') return; //ignore dead-ringer spy deaths
          this._log.incrementStatToPlayer(attacker.steamid, 'kills', customkill);
          this._log.incrementStatToPlayer(victim.steamid, 'deaths');
          this._log.incrementWeaponSpreadToPlayer(attacker.steamid, weapon.key, 'kills');
          this._log.incrementWeaponSpreadToPlayer(victim.steamid, weapon.key, 'deaths');
          this._log.addWeapon(weapon.key);
          this._log.incrementPlayerSpreadToPlayer(attacker.steamid, victim, 'kills');
          this._log.incrementPlayerSpreadToPlayer(victim.steamid, attacker, 'deaths');
          return;
        } else if(playerLineAction == 'committed suicide with') {
          var weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails)),
          attackerCoord = parsingUtils.getKillCoords(logLineDetails, 'attacker');

          if(!weapon || !attackerCoord) return; //corrupt line

          this._log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role), timestamp);

          this._log.setPlayerPosition(players[0].steamid, attackerCoord);
          players[0].position = attackerCoord;

          this._log.addKillEvent(timestamp, players[0], players[0], weapon.key, 'suicide');
          this._log.incrementWeaponSpreadToPlayer(players[0].steamid, weapon.key, 'deaths');
          this._log.addWeapon(weapon.key);
          this._log.incrementStatToPlayer(players[0].steamid, 'deaths');
          this._log.incrementPlayerSpreadToPlayer(players[0].steamid, players[0], 'deaths');

          if(this._state.medic_death) {
            processMedicDeath(this._state.medic_death);
            delete this._state.medic_death;
          }
          return;
        } else if(playerLineAction == 'picked up item') {
            var item = parsingUtils.getPickedUpItemKeyName(logLineDetails);
            if(!item) return; //corrupt line

            this._log.incrementItemSpreadToPlayer(players[0].steamid, item);
            return;
        } else if(playerLineAction == 'triggered') {
          var trigger = parsingUtils.getPlayerLineActionDetail(logLineDetails);
          if(trigger == 'kill assist') {
            //check if the kill line previous to this line was the result of dead ringer spies.
            //If so, do not increment assists.
            var prevLogLineDetails = parsingUtils.getLogLineDetails(this._state.previousLogLine),
              position = parsingUtils.getKillCoords(logLineDetails, 'assister');

            if(!position) return; //corrupt line

            this._log.setPlayerPosition(players[0].steamid, position);
            players[0].position = position;
            this._log.addAssistToLastEvent(timestamp, players[0]);

            if(parsingUtils.isLogLineOfType(prevLogLineDetails, '"')
              && parsingUtils.getPlayerLineAction(prevLogLineDetails) == 'killed'
              && parsingUtils.getCustomKill(prevLogLineDetails) == 'feign_death') {
                return;
            }

            this._log.incrementStatToPlayer(players[0].steamid, 'assists');
            return;
          } else if(trigger == 'domination') {
            this._log.incrementStatToPlayer(players[0].steamid, 'dominations');
            this._log.incrementStatToPlayer(players[1].steamid, 'timesDominated');
            this._log.addDominationEvent(timestamp, players[0], players[1]);
            return;
          } else if(trigger == 'revenge') {
            this._log.incrementStatToPlayer(players[0].steamid, 'revenges');
            this._log.addRevengeEvent(timestamp, players[0], players[1]);
            return;
          } else if(trigger == 'builtobject') {
            var object = parsingUtils.getObjectFromBuiltObject(logLineDetails), position = parsingUtils.getReportedPosition(logLineDetails);
            if(!object || !position) return; //corrupt line

            this._log.setPlayerPosition(players[0].steamid, position);
            players[0].position = position;

            if(object == 'OBJ_ATTACHMENT_SAPPER') {
              this._log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('spy'), timestamp);
            } else {
              this._log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('engineer'), timestamp);
            }

            this._log.addBuildEvent(timestamp, players[0], object);
            return;
          } else if(trigger == 'killedobject') {
            //this._log.addKillEvent(timestamp, players[0], players[1], parsingUtils.getWeapon(logLineDetails), parsingUtils.getObjectFromBuiltObject(logLineDetails));
            return;
          } else if(trigger == 'player_extinguished') {
            var weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails)),
            attackerCoord = parsingUtils.getKillCoords(logLineDetails, 'attacker'),
            victimCoord = parsingUtils.getKillCoords(logLineDetails, 'victim');

            if(!weapon || !attackerCoord || !victimCoord) return; //corrupt line

            this._log.setPlayerPosition(players[0].steamid, attackerCoord);
            players[0].position = attackerCoord;
            this._log.setPlayerPosition(players[1].steamid, victimCoord);
            players[1].position = victimCoord;

            this._log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role), timestamp);
            this._log.addExtinguishEvent(timestamp, players[0], players[1], weapon.key);
            this._log.incrementStatToPlayer(players[0].steamid, 'extinguishes');
            return;
          } else if(trigger == 'chargedeployed') {
            this._log.addUpdateRoleToPlayer(players[0].steamid, roleList.findRole('medic'), timestamp);
            this._log.addUberchargeEvent(timestamp, players[0]);
            this._log.incrementStatToPlayer(players[0].steamid, 'ubers');
            return;
          } else if(trigger == 'medic_death') {
            var attacker = players[0], victim = players[1];
            this._log.addUpdateRoleToPlayer(victim.steamid, roleList.findRole('medic'), timestamp);

            //medic_death will always surround the kill/suicide either before or after. If not before, store the medic death for later.
            if(!this._log.doesLastEventMatchPlayers(attacker.steamid, victim.steamid)) {
              this._state.medic_death = logLineDetails;
              return;
            }

            processMedicDeath(logLineDetails);
            return;
          } else if(trigger == 'damage') {
            this._log.incrementStatToPlayer(players[0].steamid, 'damage', false, parsingUtils.getDamage(logLineDetails));
            return;
          } else if(trigger == 'healed') {
            //don't add role here, engineers and medics both register heals
            var healer = players[0], patient = players[1], healing = parsingUtils.getHealing(logLineDetails);

            //don't check patient, some plugins will record a general heal statement.
            if(!healing) return; //corrupt line

            this._log.incrementHealSpreadToPlayer(healer.steamid, patient, healing);
            if(!patient) this._log.incrementStatToPlayer(healer.steamid, 'healing', false, healing);
            return;
          } else if(trigger == 'captureblocked') {
            var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
              , cpname = parsingUtils.getCapturePointName(logLineDetails);
            if(!position || !cpname) return; //corrupt line

            this._log.incrementStatToPlayer(players[0].steamid, 'pointCaptureBlocks');
            this._log.setPlayerPosition(players[0].steamid, position);
            players[0].position = position;
            this._log.addCaptureBlockedEvent(timestamp, players[0], cpname);
            return;
          } else if(trigger == 'flagevent') {
            if(this._log.getMapType() != 'ctf') {
              this._log.setMapType('ctf');
              this._log.resetScores(); //need to erase any fomer round_wins
            }

            var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
              , event = parsingUtils.getFlagEvent(logLineDetails);
            if(!position || !event) return; //corrupt line

            players[0].position = position;
            this._log.setPlayerPosition(players[0].steamid, position);

            if(event == 'defended') {
              this._log.incrementStatToPlayer(players[0].steamid, 'flagDefends');
              this._log.addFlagDefendedEvent(timestamp, players[0]);
              return;
            } else if(event == 'captured') {
              this._log.incrementStatToPlayer(players[0].steamid, 'flagCaptures');
              this._log.incrementScoreForTeam(players[0].team);
              this._log.addFlagCapturedEvent(timestamp, players[0]);
              return;
            } else if(event == 'picked up') {
              this._log.addFlagPickedUpEvent(timestamp, players[0]);
              return;
            } else if(event == 'dropped') {
              this._log.addFlagDroppedEvent(timestamp, players[0]);
              return;
            }
          }
        } else if(playerLineAction == 'entered the game') {
          this._log.setPlayerJoinedGame(players[0].steamid, timestamp);
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
              this._log.addUpdatePlayer(players[p], this._state.hasGameStarted);

              //increment each player's point captures stats
              this._log.incrementStatToPlayer(players[p].steamid, 'pointCaptures');

              //add position to players
              var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'+(parseInt(p, 10)+1)));
              if(!position) return; //corrupt line
              this._log.setPlayerPosition(players[p].steamid, position);
              players[p].position = position;
            }

            this._log.addPointCapturedEvent(timestamp, team, cpname, players);
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

          if(this._log.getMapType() != 'ctf') this._state.roundWinTeam = team;

          this._state.playableTimestampBoundaries.push({end: timestamp});
          this._state.isHumiliation = true;
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
    }).call(this); //end anon self-exe fxn

    this._state.previousTimestamp = timestamp;
    this._state.previousLogLine = logLine;
    this._log.updateRoleSecondsPlayedForAllPlayers(timestamp);
};

/**
  Exposing create method to prevent issues with not calling new (ie. assigning to global obj)
*/
module.exports = TF2LogParser;
