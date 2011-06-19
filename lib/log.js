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
  
  /**
    Adds a team chat event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param text what the player said
  */
  this.addSayTeamEvent = function(player, text) {
    _log.events.push({type: 'say_team', player: player, text: text});
  };
  
  /**
    Adds a kill event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
    @param weapon the name of the weapon used to kill the victim
    @param customkill the name of the custom kill (eg. headshot) or false
  */ 
  this.addKillEvent = function(player, victim, weapon, customkill) {
    _log.events.push({type: 'kill', player: player, victim: victim, weapon: weapon, customkill: customkill});
  };
  
  /**
    Adds a kill assist event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addAssistEvent = function(player, victim) {
    _log.events.push({type: 'assist', player: player, victim: victim});
  };
  
  /**
    Adds a domination event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addDominationEvent = function(player, victim) {
    _log.events.push({type: 'domination', player: player, victim: victim});
  };
  
  /**
    Adds a revenge event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addRevengeEvent = function(player, victim) {
    _log.events.push({type: 'revenge', player: player, victim: victim});
  };
  
  /**
    Adds a player exinguished event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
    @param weapon the name of the weapon used to put out the victim's fire
  */ 
  this.addExtinguishEvent = function(player, victim, weapon) {
    _log.events.push({type: 'exinguished', player: player, victim: victim, weapon: weapon});
  };
  
  /**
    Adds a building event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param object string retrieved from ParsingUtils#getObjectFromBuiltObject.
  */ 
  this.addBuildEvent = function(player, object) {
    _log.events.push({type: 'builtobject', player: player, object: object});
  };
  
  /**
    Adds a charge deployed event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addUberchargeEvent = function(player) {
    _log.events.push({type: 'chargedeployed', player: player});
  };
  
  /**
    Appends keys to the last event in the list.
    @param obj the keyvalue pairs to append
  */
  this.appendLastEvent = function(obj) {
    var event = _log.events[_log.events.length - 1];
    for(var key in obj) {
      event[key] = obj[key];
    }
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
      //creating a copy of the player object so that we don't accidently create a property by reference on the original variable.
      //original player objects should only have the information provided by the logs, extra data like roles should only be
      //on the player stats objects, not in events.
      var newPlayer = {
        name: player.name,
        userid: player.userid,
        steamid: player.steamid,
        team: player.team,
        roles: [],
        damage: 0,
        kills: 0,
        deaths: 0
      }
      _log.players.push(newPlayer);
    } else {
      foundPlayer.name = player.name;
      foundPlayer.userid = player.userid; //player leaves server and rejoins to get new id?
      foundPlayer.team = player.team;
    }
  };
  
  /**
    Removes a player from the log object.
    @param player single player object retrieved from ParsingUtils#getPlayers.
  */
  this.removePlayer = function(player) {
    if(!player) return;
    
    var foundPlayer = _getPlayer(player.steamid);
    if(foundPlayer === false) return;
    
    _log.players.splice(_log.players.indexOf(foundPlayer), 1);
  };
  
  /**
    Adds a role to the player.
    @param steamid string representing the steamid of the player
    @param role string of role to add to user.
  */
  this.addRoleToPlayer = function(steamid, role) {
    if(!steamid || !role) return;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    var foundRole = false;
    for(var r in foundPlayer.roles) {
      if(foundPlayer.roles[r].role == role) {
        foundRole = foundPlayer.roles[r];
        break;
      }
    }
    
    if(foundRole === false) foundPlayer.roles.push({role: 'scout'});
  };
  
  /**
    Increments the given stat for the player.
    @param steamid string representing the steamid of the player
    @param statToIncrement property on object in players array to increment (ie. damage)
    @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
  */
  this.incrementStatToPlayer = function(steamid, statToIncrement, increment) {
    if(!steamid || !statToIncrement) return;
    if(increment === 0) return;
    
    if(!increment) increment = 1;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    if(foundPlayer[statToIncrement] !== undefined) foundPlayer[statToIncrement] += increment;
    else throw new Error("player does not have the property: "+statToIncrement);
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
