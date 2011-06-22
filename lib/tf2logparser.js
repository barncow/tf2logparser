var lazy = require("lazy"),
  fs = require("fs"),
  parsingUtils = require('./parsingutils'),
  weaponList = require('./weaponlist'),
  roleList = require('./rolelist'),
  log = require('./log'),
  sys = require('sys');

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
    previousTimestamp: null,
    previousLogLine: null
  };
  
  /**
    This is a convenience function to determine if we need to skip lines or not.
  */
  var shouldIgnoreLine = function() {
    return !_state.hasGameStarted;
  };
  
  /**
    When set to true, ignore any lines that haven't been explicitly dealt with.
  */
  this.ignoreUnrecognizedLines = true;
  
  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log.getLog();
  };
  
  /**
    Utility method to read in the file one line at a time.
    @param filePath file path to the file
    @param callbackForeachLine function to call for each line. The callback is only given a string representing the line of the file.
    @param callbackWhenDone callback to be used when all lines have been read and each callback has returned. Optional.
      callbackWhenDone will be passed err if any error was caught.
  */
  this.readFile = function(filePath, callbackForeachLine, callbackWhenDone) {
    var stream = fs.createReadStream(filePath),
      self = this;
    if(callbackWhenDone) stream.on('end', function() {
      callbackWhenDone(null); //if we are here, processing completed successfully, without errors.
    });
    
    //TODO is this storing data? its join will aggregate all data into one string at the end.
    
      new lazy(stream)
        .lines
        .forEach(function(buf){
            //using call here to set "this" to the current log parser object, not the lazy object.
            try {
              callbackForeachLine.call(self, buf.toString('utf8'));
            } catch(err) {
              stream.destroy();
              if(callbackWhenDone) callbackWhenDone(err);
              throw err;
            }
          });
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
    
    if(callbackWhenDone) {
      cb = function(err) {
        self.finishLog();
        callbackWhenDone(err, self.getLog());
      }
    }
    
    this.readFile(filePath, this.parseLine, cb);
  };
  
  /**
    Does any final cleanup work, such as time calculations.
    Note - when calling parseLine manually (ie. live log feeds) make sure to call this function when done with the game.
  */
  this.finishLog = function() {
    _log.setGameTimestamp('gameEnd', _state.previousTimestamp);
    _log.setElapsedSeconds(parsingUtils.getTimestampDifference(_state.previousTimestamp, _log.getLog().gameStartTimestamp));
  }
  
  /**
    Parses a single line from a log. This is where most of the work will be done.
    Note - when calling this manually (ie. live log feeds) make sure to call finishLog when done with the game.
  */
  this.parseLine = function(logLine) {
    var timestamp = parsingUtils.getTimestamp(logLine);
    if(!timestamp) return;
    
    //doing a self-executing anonymous function here
    //so that we can do some post actions after parseLine is complete,
    //due to the way that we are returning out of the function in different
    //places each time.
    (function(){
      var logLineDetails = parsingUtils.getLogLineDetails(logLine);
        
        if(!logLineDetails) return; //corrupt line
        
        //the idea here is that when a line is recognized and dealt with as necessary, that this function would return
        //before an error could be thrown at the end. When done, return!
        //also, try to prioritize the checks by estimated frequency of occurrence.
        
        //DOING LINES THAT SHOULD BE PROCESSED REGARDLESS OF IGNORING LINES
        if(parsingUtils.isLogLineOfType(logLineDetails, 'World triggered')) {
          var worldTriggerAction = parsingUtils.getWorldTriggerAction(logLineDetails);
          if(!worldTriggerAction) return; //corrupt line
          
          if(worldTriggerAction == 'Round_Start') {
            if(!_state.hasGameStarted) {
              _state.hasGameStarted = true;
              _log.setGameTimestamp('gameStart', timestamp);
            }
            return;
          } else if(worldTriggerAction == 'Round_Win') {
            var team = parsingUtils.getRoundWinTeam(logLineDetails);
            if(!team) return; //corrupt line
            
            _log.incrementScoreForTeam(team);
            return;
          } else if(worldTriggerAction == 'Round_Setup_Begin' 
            || worldTriggerAction == 'Round_Overtime'
            | worldTriggerAction == 'Round_Length') { //it is better to compare timestamps between round_start and round_win to get the round length.
            return; //ignoring these lines
          } else if(worldTriggerAction == 'Game_Paused' || worldTriggerAction == 'Game_Unpaused') {
            return; //TODO support this when elapsed time is completed.
          }
        } else if(parsingUtils.getMap(logLineDetails)) {
          _log.getLog().mapName = parsingUtils.getMap(logLineDetails);
          return;
        }
        
        //if we need to ignore lines, let's exit here.
        if(shouldIgnoreLine()) return;
        
        if(parsingUtils.isLogLineOfType(logLineDetails, '"')) {
          //THIS IS A LINE INVOLVING A PLAYER
          
          var players = parsingUtils.getPlayers(logLineDetails),
            playerLineAction = parsingUtils.getPlayerLineAction(logLineDetails);
            
          if(!players || !playerLineAction) return; //corrupt line
          
          //make sure that the players in this line have been added to our log object
          for(var p in players) {
            _log.addUpdatePlayer(players[p]);
          }
          
          if(playerLineAction == 'say' || playerLineAction == 'say_team') {
            var text = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            if(text.charAt(0) == '!' || text.charAt(0) == '/') return; //if the say starts with !, assume its a sourcemod command. Do nothing with it. See also ParsingUtils#scrubLogLine.
            
            if(playerLineAction == 'say') _log.addSayEvent(players[0], text);
            else {
              _log.addSayTeamEvent(players[0], text);
            }
            return;
          } else if(playerLineAction == 'joined team') {
            players[0].team = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            _log.addUpdatePlayer(players[0]);
            return;
          } else if(playerLineAction == 'changed role to') {
            var role = roleList.findRole(parsingUtils.getPlayerLineActionDetail(logLineDetails));
            if(!role) return; //corrupt line
            _log.addRoleToPlayer(players[0].steamid, role);
            return;
          } else if(playerLineAction == 'disconnected') {
            //do not remove the player from the log. The player was in the server, they need to be in the log.
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
              
              _log.addRoleToPlayer(attacker.steamid, roleList.findRole(weapon.role));
              
              attacker.position = attackerCoord;
              victim.position = victimCoord;
              
            _log.addKillEvent(attacker, victim, weapon, customkill);
            
            if(customkill == 'feign_death') return; //ignore dead-ringer spy deaths
            _log.incrementStatToPlayer(attacker.steamid, 'kills');
            _log.incrementStatToPlayer(victim.steamid, 'deaths');
            return;
          } else if(playerLineAction == 'committed suicide with') {
            var customkill = parsingUtils.getCustomKill(logLineDetails), weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails), customkill);
            
            if(!weapon) return; //corrupt line
            
            _log.addRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role));
            
            _log.addKillEvent(players[0], players[0], weapon, 'suicide');
            _log.incrementStatToPlayer(players[0].steamid, 'deaths');
            
            if(_state.medic_death) {
              var healing = parsingUtils.getHealing(_state.medic_death), 
                ubercharge = parsingUtils.didMedicDieWithUber(_state.medic_death), 
                players = parsingUtils.getPlayers(_state.medic_death);
              if(ubercharge) _log.incrementStatToPlayer(players[1].steamid, 'droppedUbers');
              _log.incrementStatToPlayer(players[1].steamid, 'healing', healing);
              _log.appendLastEvent({healing: healing, ubercharge: ubercharge});
              delete _state.medic_death;
            }
            return;
          } else if(playerLineAction == 'picked up item') {
              var item = parsingUtils.getPickedUpItemKeyName(logLineDetails);
              if(!item) return; //corrupt line
              
              _log.addItemToPlayer(players[0].steamid, item);
              return;
          } else if(playerLineAction == 'triggered') {
            var trigger = parsingUtils.getPlayerLineActionDetail(logLineDetails);
            if(trigger == 'kill assist') {
              //check if the kill line previous to this line was the result of dead ringer spies.
              //If so, do not increment assists.
              var prevLogLineDetails = parsingUtils.getLogLineDetails(_state.previousLogLine);
              if(parsingUtils.isLogLineOfType(prevLogLineDetails, '"') 
                && parsingUtils.getPlayerLineAction(prevLogLineDetails) == 'killed'
                && parsingUtils.getCustomKill(prevLogLineDetails) == 'feign_death') {
                  _log.addAssistEvent(players[0], players[1], 'feign_death');
                  return;
              }
              
              _log.addAssistEvent(players[0], players[1]);
              _log.incrementStatToPlayer(players[0].steamid, 'assists');
              return;
            } else if(trigger == 'domination') {
              _log.incrementStatToPlayer(players[0].steamid, 'dominations');
              _log.addDominationEvent(players[0], players[1]);
              return;
            } else if(trigger == 'revenge') {
              _log.incrementStatToPlayer(players[0].steamid, 'revenges');
              _log.addRevengeEvent(players[0], players[1]);
              return;
            } else if(trigger == 'builtobject') {
              _log.addBuildEvent(players[0], parsingUtils.getObjectFromBuiltObject(logLineDetails));
              return;
            } else if(trigger == 'killedobject') {
              //_log.addKillEvent(players[0], players[1], parsingUtils.getWeapon(logLineDetails), parsingUtils.getObjectFromBuiltObject(logLineDetails));
              return;
            } else if(trigger == 'player_extinguished') {
              var customkill = parsingUtils.getCustomKill(logLineDetails), weapon = weaponList.findWeapon(parsingUtils.getWeapon(logLineDetails), customkill);
              
              if(!weapon) return; //corrupt line
              
              _log.addRoleToPlayer(players[0].steamid, roleList.findRole(weapon.role));
              _log.addExtinguishEvent(players[0], players[1], weapon);
              _log.incrementStatToPlayer(players[0].steamid, 'extinguishes');
              return;
            } else if(trigger == 'chargedeployed') {
              _log.addRoleToPlayer(players[0].steamid, roleList.findRole('medic'));
              _log.addUberchargeEvent(players[0]);
              _log.incrementStatToPlayer(players[0].steamid, 'ubers');
              return;
            } else if(trigger == 'medic_death') {
              var attacker = players[0], victim = players[1];
              _log.addRoleToPlayer(victim.steamid, roleList.findRole('medic'));
              
              //suicides emit this event first, kills emit this event second
              //doing this to append medic_death attributes to previous event
              if(attacker.steamid == victim.steamid) {
                _state.medic_death = logLineDetails;
                return;
              }
              
              var healing = parsingUtils.getHealing(logLineDetails), ubercharge = parsingUtils.didMedicDieWithUber(logLineDetails);
              if(healing === false) return;//corrupt line - using triple equals since it could have 0 healing which is falsey
              
              if(ubercharge) {
                _log.incrementStatToPlayer(victim.steamid, 'droppedUbers');
              }
              _log.incrementStatToPlayer(victim.steamid, 'healing', healing);
              _log.appendLastEvent({healing: healing, ubercharge: ubercharge});
              return;
            } else if(trigger == 'damage') {
              _log.incrementStatToPlayer(players[0].steamid, 'damage', parsingUtils.getDamage(logLineDetails));
              return;
            } else if(trigger == 'healed') {
              //don't add role here, engineers and medics both register heals
              var healer = players[0], patient = players[1];
              _log.incrementHealSpreadToPlayer(healer.steamid, patient, parsingUtils.getHealing(logLineDetails));
              return;
            } else if(trigger == 'captureblocked') {
              var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
                , cpname = parsingUtils.getCapturePointName(logLineDetails);
              if(!position || !cpname) return; //corrupt line
              
              _log.incrementStatToPlayer(players[0].steamid, 'pointCaptureBlocks');
              players[0].position = position;
              _log.addCaptureBlockedEvent(players[0], cpname);
              return;
            } else if(trigger == 'flagevent') {
              var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'))
                , event = parsingUtils.getFlagEvent(logLineDetails);
              if(!position || !event) return; //corrupt line
              
              if(event == 'defended') {
                _log.incrementStatToPlayer(players[0].steamid, 'flagDefends');
                players[0].position = position;
                _log.addFlagDefendedEvent(players[0]);
                return;
              } else if(event == 'captured') {
                _log.incrementStatToPlayer(players[0].steamid, 'flagCaptures');
                players[0].position = position;
                _log.addFlagCapturedEvent(players[0]);
                return;
              }
            }
          } else if(playerLineAction == 'entered the game' || playerLineAction == 'connected, address' || playerLineAction == 'STEAM USERID validated' || playerLineAction == 'changed name to') {
              return; //do nothing
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Team')) {
          var team = parsingUtils.getTeamFromTeamLine(logLineDetails), teamAction = parsingUtils.getTeamAction(logLineDetails);
          if(!team || !teamAction) return; //corrupt line
          
          if(teamAction == 'triggered') {
            var teamTriggerAction = parsingUtils.getTeamTriggerAction(logLineDetails);
            
            if(!teamTriggerAction) return; //corrupt line
            
            if(teamTriggerAction == 'pointcaptured') {
              var cpname = parsingUtils.getCapturePointName(logLineDetails)
                players = parsingUtils.getPlayers(logLineDetails);
            
              if(!cpname || !players) return; //corrupt line
          
              //make sure that the players in this line have been added to our log object
              for(var p in players) {
                _log.addUpdatePlayer(players[p]);
                
                //increment each player's point captures stats
                _log.incrementStatToPlayer(players[p].steamid, 'pointCaptures');
                
                //add position to players
                var position = parsingUtils.getCoords(parsingUtils.getParenValue(logLineDetails, 'position'+(parseInt(p, 10)+1)));
                if(!position) return; //corrupt line
                players[p].position = position;
              }
              
              _log.addPointCapturedEvent(team, cpname, players);
              return;
            }
          } else if(teamAction == 'current score') {
            return; //TODO for now, ignoring this for later. Do not use this for scoring, but determining if a round_win was legitimate or not.
          }
        } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Log file started')
          || parsingUtils.isLogLineOfType(logLineDetails, 'server_cvar:')
          || parsingUtils.isLogLineOfType(logLineDetails, 'rcon from') //See also ParsingUtils#scrubLogLine.
          ) {
          return; //ignoring these lines.
        }
        
        //still here, must not have recognized the line.
        if(!this.ignoreUnrecognizedLines) throw new Error("Did not process line: "+logLine);
      })(logLine); //end anon self-exe fxn
      
      _state.previousTimestamp = timestamp;
      _state.previousLogLine = logLine;
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
