/**
  This object is a library to hold functions to help with parsing.
*/

/**
  Providing a function to escape regular expression special characters from a string.
  http://simonwillison.net/2006/Jan/20/escape/#p-6
*/
if(!RegExp.escape) {
  RegExp.escape = function(str) {
    var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
    return str.replace(specials, "\\$&");
  }
}

/**
  Providing a trim function, by Douglas Crockford.
  http://javascript.crockford.com/remedial.html
*/
if (!String.prototype.trim) {
  String.prototype.trim = function () {
      return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
  };
}

/**
  Gets the timestamp out of the logLine.
  If the logLine is corrupt, this function will return the value false.
  @param logLine string representing the entire log line.
*/
module.exports.getTimestamp = function(logLine) {
  var matches = logLine.match(/^L (\d\d)\/(\d\d)\/(\d\d\d\d) - (\d\d):(\d\d):(\d\d)/);
  if(!matches || matches.length == 0) return false; //corrupt line
  return {
    month: parseInt(matches[1],10),
    day: parseInt(matches[2],10),
    year: parseInt(matches[3],10),
    hour: parseInt(matches[4],10),
    minute: parseInt(matches[5],10),
    second: parseInt(matches[6],10)
  };
};
  
/**
  Gets the log line details, which is the string of chars after the timestamp.
  If there is nothing after the timestamp, this will return the value false.
  @param logLine string representing the entire log line.
*/
module.exports.getLogLineDetails = function(logLine) {
  var matches = logLine.match(/^L \d\d\/\d\d\/\d\d\d\d \- \d\d:\d\d:\d\d: (.+)$/);
  if(!matches || matches.length == 0) return false; //corrupt line
  return matches[1];
};

/**
  This will get the map, if possible, from the given string.
  @param logLineDetails logLine with timestamp information.
*/
module.exports.getMap = function(logLineDetails) {
  var matches = logLineDetails.match(/^Current map "(.+?)"/);
  if(!matches || matches.length == 0) {
    //no matches, check other version
    matches = logLineDetails.match(/^Loading map "(.+?)"/);
    if(!matches || matches.length == 0) {
      //no matches, check another version
      matches = logLineDetails.match(/^Started map "(.+?)"/);
      if(!matches || matches.length == 0) {
        return false; //still no matches, therefore not a map line.
      }
    }
  }
  return matches[1];
};

/**
  Searches the beginning of the logLineDetails string for the type of the line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
  @param type string to search for
  */
module.exports.isLogLineOfType = function(logLineDetails, type) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(new RegExp("^"+RegExp.escape(type)));
  return Boolean(matches && matches.length > 0);
};

/**
  Scrubs the line of any IPs.
*/
module.exports.scrubLogLine = function(logLine) {
  return logLine.replace(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g, "255.255.255.255");
};

/**
  Retrieves the action for a player line.
  A player line is a line that starts with player information after the timestamp.
  The action is the text from the start of the first player information to a
  breaking punctuation, or the end of the string.
*/
module.exports.getPlayerLineAction = function(logLineDetails) {
  var matches = logLineDetails.match(/^\".+?<\d+?><[A-Za-z0-9:_]+?><\w*?>\" ([\w ,]+)/);
  if(matches && matches.length > 0) {
    return (matches[1]).trim();
  } else return false
};
