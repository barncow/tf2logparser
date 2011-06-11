/**
  This object is a library to hold functions to help with parsing.
*/

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
  var START_INDEX = 25;
  if(logLine.length <= START_INDEX) return false; //corrupt line
  return logLine.substring(START_INDEX, logLine.length);
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
