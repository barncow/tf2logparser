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
  
  /**********************************
    Functions for maintaining events.
  */
  
  /**
    Adds a global chat event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param text what the player said
  */
  this.addSayEvent = function(player, text) {
    _log.events.push({type: 'say', player: player, text: text});
  };
  
  /*********************************
    Functions for maintaining Players.
  */
  
  /**
    Gets a player by their steamid. This reference can then edit the array, so be careful!
    PRIVATE - because this can mutate the array if you are not careful, this getter is private.
    @param steamid string of the steamid of the player.
  */
   var _getPlayer = function(steamid) {
    if(!steamid) return false;
    
    var foundPlayer = false;
    
    for(var p in _log.players) {
      if(_log.players[p].steamid == steamid) {
        foundPlayer = _log.players[p];
        break;
      }
    }
    
    if(foundPlayer === false) return false;
    else return foundPlayer;
  };
  
  /**
    Adds or updates the player given to the log object.
    @param player single player object retrieved from ParsingUtils#getPlayers.
  */
  this.addUpdatePlayer = function(player) {
    if(!player) return;
    
    var foundPlayer = _getPlayer(player.steamid);
    
    if(foundPlayer === false) {
      player.roles = [];
      _log.players.push(player);
    } else {
      foundPlayer.name = player.name;
      foundPlayer.userid = player.userid; //player leaves server and rejoins to get new id?
      foundPlayer.team = player.team;
    }
  };
  
  /**
    Adds a role to the player.
    @param steamid string representing the steamid of the player
    @param role string of role to add to user.
  */
  this.addRoleToPlayer = function(steamid, role) {
    if(!steamid || !role) return;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw "Could not find player: "+steamid;
    
    var foundRole = false;
    for(var r in foundPlayer.roles) {
      if(foundPlayer.roles[r].role == role) {
        foundRole = foundPlayer.roles[r];
        break;
      }
    }
    
    if(foundRole === false) foundPlayer.roles.push({role: 'scout'});
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
