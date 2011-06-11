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
    if(callbackWhenDone) stream.on('end', callbackWhenDone);
    
    //todo is this storing data? its join will aggregate all data into one string at the end.
    new lazy(stream)
      .lines
      .forEach(function(buf){
          //using call here to set "this" to the current log parser object, not the lazy object.
          callbackForeachLine.call(self, buf.toString('utf8'));
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
      cb = function() {
        callbackWhenDone(self.getLog());
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
