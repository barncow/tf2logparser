var lazy = require("lazy"),
  fs = require("fs"),
  parsingUtils = require('./parsingutils'),
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
    hasGameStarted: false //whether or not we have encountered our first "round_start"
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
        callbackWhenDone(err, self.getLog());
      }
    }
    
    this.readFile(filePath, this.parseLine, cb);
  };
  
  /**
    Parses a single line from a log. This is where most of the work will be done.
  */
  this.parseLine = function(logLine) {
    var timestamp = parsingUtils.getTimestamp(logLine),
      logLineDetails = parsingUtils.getLogLineDetails(logLine);
      
      if(!timestamp || !logLineDetails) return; //corrupt line
      
      //the idea here is that when a line is recognized and dealt with as necessary, that this function would return
      //before an error could be thrown at the end. When done, return!
      //also, try to prioritize the checks by estimated frequency of occurrence.
      
      //DOING LINES THAT SHOULD BE PROCESSED REGARDLESS OF IGNORING LINES
      if(parsingUtils.isLogLineOfType(logLineDetails, 'World triggered')) {
        var worldTriggerAction = parsingUtils.getWorldTriggerAction(logLineDetails);
        if(!worldTriggerAction) return; //corrupt line
        
        if(worldTriggerAction == 'Round_Start') {
          _state.hasGameStarted = true;
          return;
        } else if(worldTriggerAction == 'Round_Setup_Begin') {
          return; //ignoring these lines
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
          _log.addRoleToPlayer(players[0].steamid, parsingUtils.getPlayerLineActionDetail(logLineDetails));
          return;
        } else if(playerLineAction == 'disconnected') {
          //do not remove the player from the log. The player was in the server, they need to be in the log.
          return;
        } else if(playerLineAction == 'killed') {
          var attacker = players[0];
          var victim = players[1];
          _log.addKillEvent(attacker, victim, parsingUtils.getWeapon(logLineDetails), parsingUtils.getCustomKill(logLineDetails));
          _log.incrementStatToPlayer(attacker.steamid, 'kills');
          _log.incrementStatToPlayer(victim.steamid, 'deaths');
          return;
        } else if(playerLineAction == 'committed suicide with') {
          _log.addKillEvent(players[0], players[0], parsingUtils.getWeapon(logLineDetails), 'suicide');
          _log.incrementStatToPlayer(players[0].steamid, 'deaths');
          if(_state.medic_death) {
            _log.appendLastEvent({healing: parsingUtils.getHealing(_state.medic_death), ubercharge: parsingUtils.didMedicDieWithUber(_state.medic_death)});
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
            _log.addAssistEvent(players[0], players[1]);
            return;
          } else if(trigger == 'domination') {
            _log.addDominationEvent(players[0], players[1]);
            return;
          } else if(trigger == 'revenge') {
            _log.addRevengeEvent(players[0], players[1]);
            return;
          } else if(trigger == 'builtobject') {
            _log.addBuildEvent(players[0], parsingUtils.getObjectFromBuiltObject(logLineDetails));
            return;
          } else if(trigger == 'killedobject') {
            _log.addKillEvent(players[0], players[1], parsingUtils.getWeapon(logLineDetails), parsingUtils.getObjectFromBuiltObject(logLineDetails));
            return;
          } else if(trigger == 'player_extinguished') {
            _log.addExtinguishEvent(players[0], players[1], parsingUtils.getWeapon(logLineDetails));
            return;
          } else if(trigger == 'chargedeployed') {
            _log.addUberchargeEvent(players[0]);
            return;
          } else if(trigger == 'medic_death') {
            //suicides emit this event first, kills emit this event second
            if(players[0].userid == players[1].userid) {
              _state.medic_death = logLineDetails;
              return;
            }
            _log.appendLastEvent({healing: parsingUtils.getHealing(logLineDetails), ubercharge: parsingUtils.didMedicDieWithUber(logLineDetails)});
            return;
          } else if(trigger == 'damage') {
            _log.incrementStatToPlayer(players[0].steamid, 'damage', parsingUtils.getDamage(logLineDetails));
            return;
          } else if(trigger == 'healed') {
            var healer = players[0], patient = players[1];
            _log.incrementHealSpreadToPlayer(healer.steamid, patient, parsingUtils.getHealing(logLineDetails));
            return;
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
        }
      } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Log file started')
        || parsingUtils.isLogLineOfType(logLineDetails, 'server_cvar:')
        || parsingUtils.isLogLineOfType(logLineDetails, 'rcon from') //See also ParsingUtils#scrubLogLine.
        ) {
        return; //ignoring these lines.
      }
      
      //still here, must not have recognized the line.
      if(!this.ignoreUnrecognizedLines) throw new Error("Did not process line: "+logLine);
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
