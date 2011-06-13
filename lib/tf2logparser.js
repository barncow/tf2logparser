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
      
      if(parsingUtils.isLogLineOfType(logLineDetails, '"')) {
        //THIS IS A LINE INVOLVING A PLAYER
        
        var players = parsingUtils.getPlayers(logLineDetails),
          playerLineAction = parsingUtils.getPlayerLineAction(logLineDetails);
          
        if(!players || !playerLineAction) return; //corrupt line
        
        for(var p in players) {
          _log.addUpdatePlayer(players[p]);
        }
        
        if(playerLineAction == 'say') {
          var text = parsingUtils.getPlayerLineActionDetail(logLineDetails);
          if(text.charAt(0) == '!' || text.charAt(0) == '/') return; //if the say starts with !, assume its a sourcemod command. Do nothing with it. See also ParsingUtils#scrubLogLine.
          
          _log.addSayEvent(players[0], text);
          return;
        } else if(playerLineAction == 'joined team') {
          players[0].team = parsingUtils.getPlayerLineActionDetail(logLineDetails);
          _log.addUpdatePlayer(players[0]);
          return;
        } else if(playerLineAction == 'changed role to') {
          _log.addRoleToPlayer(players[0].steamid, parsingUtils.getPlayerLineActionDetail(logLineDetails));
          return;
        } else if(playerLineAction == 'entered the game') {
          return; //do nothing
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
