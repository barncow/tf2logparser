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
  var _state = {};
  
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
          players[0].online = false;
          _log.addUpdatePlayer(players[0]);
          if(players[0].team == null && _log.getPlayerRoles(players[0].steamid).length == 0) {
            // It is safe to say the player is unimportant as they never joined a class and were not in a team.
            _log.removePlayer(players[0]);
          }
          return;
        } else if(playerLineAction == 'killed') {
          _log.addKillEvent(players[0], players[1], parsingUtils.getWeapon(logLineDetails), parsingUtils.getCustomKill(logLineDetails));
          return;
        } else if(playerLineAction == 'committed suicide with') {
          _log.addKillEvent(players[0], players[0], parsingUtils.getWeapon(logLineDetails), 'suicide');
          if(_state.medic_death) {
            _log.appendLastEvent({healing: parsingUtils.getHealing(_state.medic_death), ubercharge: parsingUtils.didMedicDieWithUber(_state.medic_death)});
            delete _state.medic_death;
          }
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
          }
        } else if(playerLineAction == 'entered the game' || playerLineAction == 'connected, address' || playerLineAction == 'STEAM USERID validated' || playerLineAction == 'changed name to') {
            return; //do nothing
        }
      } else if(parsingUtils.getMap(logLineDetails)) {
        _log.getLog().mapName = parsingUtils.getMap(logLineDetails);
        return;
      } else if(parsingUtils.isLogLineOfType(logLineDetails, 'Log file started')
        || parsingUtils.isLogLineOfType(logLineDetails, 'server_cvar:')
        || parsingUtils.isLogLineOfType(logLineDetails, 'rcon from') //See also ParsingUtils#scrubLogLine.
        ) {
        return; //ignoring these lines.
      } else if(parsingUtils.getWorldTriggerAction(logLineDetails)) {
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
