var lazy = require("lazy"),
  fs = require("fs");

/**
  This object is used to parse a file, or a series of TF2 Log lines.
*/
function TF2LogParser() {
  /**
    This will hold the accumulated data.
  */
  var _log = {};
  
  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log;
  };
  
  /**
    Utility method to read in the file one line at a time.
    @param filePath file path to the file
    @param callback function to call for each line. The callback is only given a string representing the line of the file.
  */
  this.readFile = function(filePath, callback) {
    //streaming in the file one line at a time.
    new lazy(fs.createReadStream(filePath))
      .lines
      .forEach(function(buf){
          callback(buf.toString('utf8'));
        }
      );
  }
  
  /**
    Parses a log file from disk.
    @param filePath file path to the file to process.
  */
  this.parseLogFile = function(filePath) {
    this.readFile(filePath, this.parseLine);
  }
  
  /**
    Parses a single line from a log. This is where most of the work will be done.
  */
  this.parseLine = function(logLine) {
    console.log(logLine);
  }
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
