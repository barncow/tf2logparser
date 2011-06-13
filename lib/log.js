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
    mapName: "",
    events: [],
    players: []
  };
  
  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log;
  };
  
  /**
    Functions for maintaining events.
  */
  this.addSayEvent = function(player, text) {
    _log.events.push({type: 'say', player: player, text: text});
  }
  
  /**
    Functions for maintaining Players.
  */
  this.addUpdatePlayer = function(player) {
    if(!player) return;
    
    var foundPlayer = false;
    
    for(var p in _log.players) {
      if(_log.players[p].steamid == player.steamid) {
        foundPlayer = _log.players[p];
        foundPlayer.name = player.name;
        foundPlayer.userid = player.userid; //player leaves server and rejoins to get new id?
        foundPlayer.team = player.team;
        break;
      }
    }
    
    if(foundPlayer === false) _log.players.push(player);
  }
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
