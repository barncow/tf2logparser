var parsingUtils = require('./parsingutils.js');

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
    gameStartTimestamp: null,
    gameEndTimestamp: null,
    elapsedSeconds: 0,
    playableSeconds: 0,
    mapName: "",
    events: [],
    players: [],
    weapons: {}
  };
  
  /**
    Accessor for the data.
  */
  this.getLog = function() {
    return _log;
  };
  
  /**********************************
    Functions for maintaining top level log properties.
  */
  
  /**
    Increments the score for the given team.
    @param team case-insensitive string of the team that scored
    @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
  */
  this.incrementScoreForTeam = function(team, increment) {
    team = team.toLowerCase();
    if(increment === 0) return;
    
    if(!increment) increment = 1;
    if(_log[team+'Score'] !== undefined) _log[team+'Score'] += increment;
    else throw new Error("Invalid team: "+team);
  };
  
  /**
    Sets the gameStart or gameEnd timestamps.
    @param type Either "gameStart" or "gameEnd"
    @param timestamp the value to set.
  */
  this.setGameTimestamp = function(type, timestamp) {
    if(type != 'gameStart' && type != 'gameEnd') throw new Error('Timestamp type not found: '+type);
    if(!timestamp) return false;
    
    _log[type+'Timestamp'] = timestamp;
  };
  
  /**
    Sets the total elapsed seconds for the log.
    @param secs the value to set.
  */
  this.setElapsedSeconds = function(secs) {
    _log.elapsedSeconds = secs;
  };
  
  /**
    Sets the number of seconds that the players could actually play.
    @param secs the value to set.
  */
  this.setPlayableSeconds = function(secs) {
    _log.playableSeconds = secs;
  };
  
  /**
    Adds the weapon to the log. This is useful for tracking all weapons used in the game, since
    the weapon stats will only carry the pertinent weapons for each player (everything else is 0/0).
    @param weapon full weapon object
  */
  this.addWeapon = function(weapon) {
    if(!weapon) return;
    else if(_log.weapons[weapon.key] === undefined) _log.weapons[weapon.key] = weapon;
  };
  
  /**********************************
    Functions for maintaining events.
  */
  
  /**
    Adds a global chat event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param text what the player said
  */
  this.addSayEvent = function(timestamp, player, text) {
    _log.events.push({timestamp: timestamp, type: 'say', player: player, text: text});
  };
  
  /**
    Adds a team chat event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param text what the player said
  */
  this.addSayTeamEvent = function(timestamp, player, text) {
    _log.events.push({timestamp: timestamp, type: 'say_team', player: player, text: text});
  };
  
  /**
    Adds a kill event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
    @param weapon the name of the weapon used to kill the victim
    @param customKill the name of the custom kill (eg. headshot) or false
  */
  this.addKillEvent = function(timestamp, player, victim, weapon, customKill) {
    _log.events.push({timestamp: timestamp, type: 'kill', player: player, victim: victim, weapon: weapon, customKill: customKill});
  };
  
  /**
    Adds a kill assist event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
    @param customKill optional - string representing the customkill option from the previous kill line. Mainly used for DR spies.
  */ 
  this.addAssistEvent = function(timestamp, player, victim, customKill) {
    if(!customKill) customKill = false; //converting any falsey value to just false
    _log.events.push({timestamp: timestamp, type: 'assist', player: player, victim: victim, customKill: customKill});
  };
  
  /**
    Adds a domination event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addDominationEvent = function(timestamp, player, victim) {
    _log.events.push({timestamp: timestamp, type: 'domination', player: player, victim: victim});
  };
  
  /**
    Adds a revenge event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addRevengeEvent = function(timestamp, player, victim) {
    _log.events.push({timestamp: timestamp, type: 'revenge', player: player, victim: victim});
  };
  
  /**
    Adds a player exinguished event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param victim single player object retrieved from ParsingUtils#getPlayers.
    @param weapon the name of the weapon used to put out the victim's fire
  */ 
  this.addExtinguishEvent = function(timestamp, player, victim, weapon) {
    _log.events.push({timestamp: timestamp, type: 'exinguished', player: player, victim: victim, weapon: weapon});
  };
  
  /**
    Adds a building event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
    @param object string retrieved from ParsingUtils#getObjectFromBuiltObject.
  */ 
  this.addBuildEvent = function(timestamp, player, object) {
    _log.events.push({timestamp: timestamp, type: 'builtobject', player: player, object: object});
  };
  
  /**
    Adds a charge deployed event to the list.
    @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
    @param player single player object retrieved from ParsingUtils#getPlayers.
  */ 
  this.addUberchargeEvent = function(timestamp, player) {
    _log.events.push({timestamp: timestamp, type: 'chargedeployed', player: player});
  };
  
  /**
    Adds a point captured event to the list.
    @param team name of the team performing the action (ie. "Blue")
    @param cpname string of the capture point name
    @param players an array of player objects retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for each player.
  */ 
  this.addPointCapturedEvent = function(timestamp, team, cpname, players) {
    _log.events.push({timestamp: timestamp, type: 'pointcaptured', team: team, cpname: cpname, players: players});
  };
  
  /**
    Adds a point captured event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
    @param cpname string of the capture point name
  */ 
  this.addCaptureBlockedEvent = function(timestamp, player, cpname) {
    _log.events.push({timestamp: timestamp, type: 'captureblocked', player: player, cpname: cpname});
  };
  
  /**
    Adds a flag defended event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
  */ 
  this.addFlagDefendedEvent = function(timestamp, player) {
    _log.events.push({timestamp: timestamp, type: 'flagdefended', player: player});
  };
  
  /**
    Adds a flag captured event to the list.
    @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
  */ 
  this.addFlagCapturedEvent = function(timestamp, player) {
    _log.events.push({timestamp: timestamp, type: 'flagcaptured', player: player});
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
    @param isInMatch true if the player is in the match, false if not.
    @param online Optional - true or false if online or not. If not specified, true is assumed.
  */
  this.addUpdatePlayer = function(player, isInMatch, online) {
    if(!player) return;
    if(online === undefined) online = true;
    
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
        friendid: parsingUtils.convertSteamFriendId(player.steamid),
        roles: [],
        damage: 0,
        online: online,
        kills: 0,
        deaths: 0,
        assists: 0,
        longest_kill_streak: 0,
        headshots: 0,
        backstabs: 0,   
        pointCaptures: 0,
        pointCaptureBlocks: 0,
        flagDefends: 0,
        flagCaptures: 0,
        dominations: 0,
        timesDominated: 0,
        revenges: 0,
        extinguishes: 0,
        ubers: 0,
        droppedUbers: 0,
        healing: 0,
        medPicksTotal: 0,
        medPicksDroppedUber: 0,
        items: {},
        healSpread: [],
        position: {},
        weaponStats: {},
        isInMatch: isInMatch
      }
      _log.players.push(newPlayer);
    } else {
      foundPlayer.name = player.name;
      foundPlayer.userid = player.userid; //player leaves server and rejoins to get new id?
      foundPlayer.team = player.team;
      foundPlayer.online = online;
      foundPlayer.isInMatch = isInMatch;
    }
  };
  
  /**
    Sets the position of the player from the log_verbose_enable position_report line.
    @param steamid string representing the steamid of the player
    @param position object as retrieved from ParsingUtils#getCoords
  */
  this.setPlayerPosition = function(steamid, position) {
    if(!steamid || !position) return;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    foundPlayer.position = position;
  }
  
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
    remove isInMatch == false players, and then the property from all players.
  */
  this.pruneNotInMatch = function() {
    var playersToRemove = []; //storing players to be removed later.
    for(var p in _log.players) {

      if(_log.players[p].isInMatch === false) {
        //if player is not marked as in match, remove player.
        playersToRemove.push(_log.players[p]);
      } else {
        delete _log.players[p].isInMatch;
      }
    }
    
    for(var p in playersToRemove) {
      this.removePlayer(playersToRemove[p]);
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
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    var foundRole = false;
    for(var r in foundPlayer.roles) {
      if(foundPlayer.roles[r].key == role.key) {
        foundRole = foundPlayer.roles[r];
        break;
      }
    }
    
    if(foundRole === false) foundPlayer.roles.push(role);
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
  };
  
  /**
    Increments the given weapon stat for the player.
    @param steamid string representing the steamid of the player
    @param weapon full weapon object
    @param statToIncrement property on object in players array to increment (ie. damage)
    @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
  */
  this.incrementWeaponStatToPlayer = function(steamid, weapon, statToIncrement, increment) {
    if(!steamid || !weapon || !statToIncrement) return;
    else if(statToIncrement != 'kills' && statToIncrement != 'deaths') throw new Error("Invalid statToIncrement given: "+statToIncrement);
    else if(increment === 0) return;
    
    if(!increment) increment = 1;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    if(foundPlayer.weaponStats[weapon.key] === undefined) {
      foundPlayer.weaponStats[weapon.key] = {
        key: weapon.key,
        name: weapon.name,
        role: weapon.role,
        kills: 0,
        deaths: 0
      };
    }
    
    foundPlayer.weaponStats[weapon.key][statToIncrement] += increment;
  };
  
  /**
    Adds an item to the player, such as "medkit_small".
    @param steamid string representing the steamid of the player
    @param item string of the item name (ie. "medkit_small")
    @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
  */
  this.addItemToPlayer = function(steamid, item, increment) {
    if(!steamid || !item) return;
    if(increment === 0) return;
    
    if(!increment) increment = 1;
    
    var foundPlayer = _getPlayer(steamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    if(foundPlayer.items[item] === undefined) foundPlayer.items[item] = increment;
    else foundPlayer.items[item] += increment;
  };
  
  /**
    Adds heal spread statistics (who healed whom for how much) to a player
    Note - The supplemental stats plugin also tracks healing done by engineers from dispensers.
    @param healerSteamid string representing the steamid of the player doing the healing
    @param patientPlayer single player object retrieved from ParsingUtils#getPlayers of the person being healed.
    @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
  */
  this.incrementHealSpreadToPlayer = function(healerSteamid, patientPlayer, increment) {
    if(!healerSteamid || !patientPlayer) return;
    if(increment === 0) return;
    
    if(!increment) increment = 1;
    
    var foundPlayer = _getPlayer(healerSteamid);
    if(foundPlayer === false) throw new Error("Could not find player: "+steamid);
    
    var foundPatient = false;
    for(var p in foundPlayer.healSpread) {
      if(foundPlayer.healSpread[p].patient.steamid == patientPlayer.steamid) {
        foundPatient = true;
        foundPlayer.healSpread[p].healing += increment;
        break;
      }
    }
    
    if(!foundPatient) {
      foundPlayer.healSpread.push({patient: patientPlayer, healing: increment});
    }
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
