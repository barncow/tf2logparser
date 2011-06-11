/**
  This object contains information about the data in a log, and has methods to safely mutate the data structure.
*/
function Log() {
  /**
    This will hold the accumulated data.
  */
  var _log = {
    blueScore: 0,
    redScore: 0,
    elapsedTime: 0,
    gameSeconds: 0,
    mapName: ""
  };
  
  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log;
  };
}

/**
  Exposing create method to prevent issues with not calling new (ie. assigning to global obj)
*/
module.exports.create = function() {
  return new Log();
}

/**
  Exposing class definition for users to inherit from.
*/
module.exports._class = Log;
