var parsingUtils = require('./parsingutils.js');

/**
  This object contains information about the data in a log, and has methods to safely mutate the data structure.
  @param calculateDeltas If true, will save the changes made during manipulating data in this obj.
  Caveat - some events (assist and medic_death) require changing the previous event and updating this data. Deltas will not get these changes.
*/
function Log(calculateDeltas) {
  if(!(this instanceof Log)) return new Log();

  /**
    This will hold the accumulated data.
  */
  this._log = {
    blueScore: 0,
    redScore: 0,
    gameStartTimestamp: null,
    gameEndTimestamp: null,
    elapsedSeconds: 0,
    playableSeconds: 0,
    mapName: "",
    mapType: "cp",
    events: [],
    players: [],
    weapons: [],
    positions: []
  };

  /**
    Holds information on what data has been changed between retrievals of this value, but when isRealTime == true.
  */
  this.calculateDeltas = calculateDeltas;
  this._deltas = [];

  /**
   A place to hold temporary information, for instance, the current number of kills between deaths.
  */
  this._scratch = {
    numKills: {},
    numDeaths: {},
    roleStart: {}
  };
}

/**
  Accessor for the data.
*/
Log.prototype.getLog = function() {
  return this._log;
};

/**
  Retrieves the deltas. Deletes the value after it is used.
*/
Log.prototype.getDeltas = function() {
  var tmp = this._deltas.slice(); //make a copy of the array
  this._deltas = []; //wipe current value
  return tmp;
};

/**********************************
  Functions for maintaining top level log properties.
*/

/**
  Gets the current number of players.
*/
Log.prototype.getPlayerCount = function() {
  var count = 0;
  for(var i in this._log.players) {
    //only count the player if:
    //if the player has the isInMatch, and its true (user is actually in match), increase count
    //if the player does not have the isInMatch, increase count.
    if(this._log.players[i].isInMatch !== undefined && this._log.players[i].isInMatch) ++count;
    else if(this._log.players[i].isInMatch === undefined) ++count;
  }
  return count;
};

/**
  Sets the map type. Mainly a way to differentiate cp and ctf scoring.
*/
Log.prototype.setMapType = function(type) {
  if(!type) throw new Error("type not valid: "+type);

  this._log.mapType = type;
};

/**
  Gets the map type. Mainly a way to differentiate cp and ctf scoring.
*/
Log.prototype.getMapType = function() {
  return this._log.mapType;
};

/**
  Increments the score for the given team.
  @param team case-insensitive string of the team that scored
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementScoreForTeam = function(team, increment) {
  team = team.toLowerCase();
  if(increment === 0) return;

  if(!increment) increment = 1;
  if(this._log[team+'Score'] !== undefined) this._log[team+'Score'] += increment;
  else throw new Error("Invalid team: "+team);
};

/**
  Resets the scores. Generally used when switching scoring type (ie. cp to ctf)
*/
Log.prototype.resetScores = function() {
  this._log.blueScore = 0;
  this._log.redScore = 0;
};

/**
  Switches the scores. Generally used when teams have been switched
*/
Log.prototype.switchScores = function() {
  var blueScore = this._log.blueScore;
  this._log.blueScore = this._log.redScore;
  this._log.redScore = blueScore;
};

/**
  Sets the gameStart or gameEnd timestamps.
  @param type Either "gameStart" or "gameEnd"
  @param timestamp the value to set.
*/
Log.prototype.setGameTimestamp = function(type, timestamp) {
  if(type != 'gameStart' && type != 'gameEnd') throw new Error('Timestamp type not found: '+type);
  if(!timestamp) return false;

  this._log[type+'Timestamp'] = timestamp;
};

/**
  Sets the total elapsed seconds for the log.
  @param secs the value to set.
*/
Log.prototype.setElapsedSeconds = function(secs) {
  this._log.elapsedSeconds = secs;
};

/**
  Sets the number of seconds that the players could actually play.
  @param secs the value to set.
*/
Log.prototype.setPlayableSeconds = function(secs) {
  this._log.playableSeconds = secs;
};

/**
  Adds the weapon to the log. This is useful for tracking all weapons used in the game, since
  the weapon stats will only carry the pertinent weapons for each player (everything else is 0/0).
  @param weapon_key the key value of the weapon taken from log
*/
Log.prototype.addWeapon = function(weapon_key) {
  if(!weapon_key) return;
  for(var w in this._log.weapons) {
    if(this._log.weapons[w] == weapon_key) return; //if the weapon has already been added, we are done.
  }

  //still here, add the weapon.
  this._log.weapons.push(weapon_key);
};

/**********************************
  Functions for maintaining events.
*/

/**
  private convenience function to update events with a role that was just found.
  It will only replace falsey roles for the player
  @param steamid steamid of player to update
  @param role role of player
*/
Log.prototype._updateRoleToEvents = function(steamid, role) {
  //events
  for(var i = this._log.events.length-1; i >= 0; --i) {
    var e = this._log.events[i];
    if(e.player && e.player.steamid == steamid && !e.player.role) e.player.role = role;
    if(e.victim && e.victim.steamid == steamid && !e.victim.role) e.victim.role = role;
    if(e.assister && e.assister.steamid == steamid && !e.assister.role) e.assister.role = role;
    if(e.players) {
      for(var p in e.players) {
        if(e.players[p].steamid == steamid) e.players[p].role = role;
      }
    }
  }

  //positions
  for(var i = this._log.positions.length-1; i >= 0; --i) {
    var e = this._log.positions[i];
    if(e.player && e.player.steamid == steamid && !e.player.role) e.player.role = role;
  }
};

/**
  Adds a global chat event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param text what the player said
*/
Log.prototype.addSayEvent = function(timestamp, player, text) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'say', player: player, text: text};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a team chat event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param text what the player said
*/
Log.prototype.addSayTeamEvent = function(timestamp, player, text) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'say_team', player: player, text: text};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a kill event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param victim single player object retrieved from ParsingUtils#getPlayers.
  @param weapon_key the key name of the weapon used to kill the victim
  @param customKill the name of the custom kill (eg. headshot) or false
*/
Log.prototype.addKillEvent = function(timestamp, player, victim, weapon_key, customKill) {
  player = this._addRoleInfoToPlayerObject(player);
  victim = this._addRoleInfoToPlayerObject(victim);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'kill', player: player, victim: victim, assister: false, weapon: weapon_key, customKill: customKill};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Changes the previous kill event to have the assister given.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param assister single player object retrieved from ParsingUtils#getPlayers that represents the assister.
  @param customKill optional - string representing the customkill option from the previous kill line. Mainly used for DR spies.
*/
Log.prototype.addAssistToLastEvent = function(timestamp, assister) {
  assister = this._addRoleInfoToPlayerObject(assister);
  var event = this._log.events[this._log.events.length - 1];
  if(event.assister !== undefined) event.assister = assister;
};

/**
  Adds a domination event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param victim single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.addDominationEvent = function(timestamp, player, victim) {
  player = this._addRoleInfoToPlayerObject(player);
  victim = this._addRoleInfoToPlayerObject(victim);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'domination', player: player, victim: victim};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a revenge event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param victim single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.addRevengeEvent = function(timestamp, player, victim) {
  player = this._addRoleInfoToPlayerObject(player);
  victim = this._addRoleInfoToPlayerObject(victim);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'revenge', player: player, victim: victim};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player exinguished event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param victim single player object retrieved from ParsingUtils#getPlayers.
  @param weapon_key the key name of the weapon used to put out the victim's fire
*/
Log.prototype.addExtinguishEvent = function(timestamp, player, victim, weapon_key) {
  player = this._addRoleInfoToPlayerObject(player);
  victim = this._addRoleInfoToPlayerObject(victim);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'exinguished', player: player, victim: victim, weapon: weapon_key};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a building event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param object string retrieved from ParsingUtils#getObjectFromBuiltObject.
  @param position position object of where the building is
*/
Log.prototype.addBuildEvent = function(timestamp, player, object, position) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'builtobject', player: player, object: object, position: position};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a killed object event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param destroyer single player object retrieved from ParsingUtils#getPlayers.
  @param owner single player object retrieved from ParsingUtils#getPlayers.
  @param object string retrieved from ParsingUtils#getObjectFromBuiltObject.
*/
Log.prototype.addKillObjectEvent = function(timestamp, destroyer, owner, object) {
  destroyer = this._addRoleInfoToPlayerObject(destroyer);
  owner = this._addRoleInfoToPlayerObject(owner);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'killedobject', destroyer: destroyer, owner: owner, object: object};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a charge deployed event to the list.
  @param timestamp single timestamp object retrieved from parsingUtils#getTimestamp.
  @param player single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.addUberchargeEvent = function(timestamp, player) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'chargedeployed', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a point captured event to the list.
  @param team name of the team performing the action (ie. "Blue")
  @param cpname string of the capture point name
  @param players an array of player objects retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for each player.
*/
Log.prototype.addPointCapturedEvent = function(timestamp, team, cpname, players) {
  for(var p in players) {
    players[p] = this._addRoleInfoToPlayerObject(players[p]);
  }
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'pointcaptured', team: team, cpname: cpname, players: players};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a point captured event to the list.
  @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
  @param cpname string of the capture point name
*/
Log.prototype.addCaptureBlockedEvent = function(timestamp, player, cpname) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'captureblocked', player: player, cpname: cpname};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a flag defended event to the list.
  @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
*/
Log.prototype.addFlagDefendedEvent = function(timestamp, player) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'flagdefended', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a flag captured event to the list.
  @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
*/
Log.prototype.addFlagCapturedEvent = function(timestamp, player) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'flagcaptured', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a flag picked up event to the list.
  @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
*/
Log.prototype.addFlagPickedUpEvent = function(timestamp, player) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'flagpickedup', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a flag dropped event to the list.
  @param player single player object retrieved from ParsingUtils#getPlayers. Should also have the "position" parameter for the player.
*/
Log.prototype.addFlagDroppedEvent = function(timestamp, player) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'flagdropped', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player joined team event
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param team new team
*/
Log.prototype.addJoinedTeamEvent = function(timestamp, player, team){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'joinedteam', player: player, team: team};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player joined team event
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param oldName player's old name
  @param newName player's new name
*/
Log.prototype.addChangedNameEvent = function(timestamp, player, oldName, newName){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'changedname', player: player, oldName: oldName, newName: newName};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player role change event
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param role player's role
*/
Log.prototype.addRoleChangeEvent = function(timestamp, player, role){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'changedrole', player: player, role: role};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player spawn event
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param role player's role
*/
Log.prototype.addSpawnEvent = function(timestamp, player, role){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'spawnedas', player: player, role: role};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player disconnected event
  @param player single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.addDisconnectedEvent = function(timestamp, player){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'disconnected', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player entered game event
  @param player single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.addEnteredGameEvent = function(timestamp, player){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'enteredgame', player: player};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a round start event
*/
Log.prototype.addRoundStartEvent = function(timestamp){
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'roundstart'};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a round win event
*/
Log.prototype.addRoundWinEvent = function(timestamp){
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'roundwin'};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a round setup begin event
*/
Log.prototype.addRoundSetupBeginEvent = function(timestamp){
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'roundsetupbegin'};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a round setup end event
*/
Log.prototype.addRoundSetupEndEvent = function(timestamp){
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'roundsetupend'};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a player picked up item event
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param item string of item that the player picked up
*/
Log.prototype.addPickedUpItemEvent = function(timestamp, player, item){
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'pickedupitem', player: player, item: item};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a score change event for the given team. Current score will be added to the event.
  @param team object as retrieved from ParsingUtils#getCoords
*/
Log.prototype.addScoreChangeEvent = function(timestamp, team){
  var score;
  if(team == 'Red') score = this._log.redScore;
  else score = this._log.blueScore;

  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), type: 'scorechange', team: team, score: score};
  this._log.events.push(e);
  if(this.calculateDeltas) this._deltas.push({events: [e]});
};

/**
  Adds a position event to the positions list. This list is separated because it will be quite large, and this will make it easier to remove and save differently if needed.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param position object as retrieved from ParsingUtils#getCoords
*/
Log.prototype.addPositionEvent = function(timestamp, player, position) {
  player = this._addRoleInfoToPlayerObject(player);
  var e = {timestamp: timestamp, elapsedSeconds: parsingUtils.getTimestampDifference(timestamp, this._log.gameStartTimestamp), player: player, position: position};
  this._log.positions.push(e);
  if(this.calculateDeltas) this._deltas.push({positions: [e]});
};

/**
  Appends keys to the last event in the list.
  @param obj the keyvalue pairs to append
*/
Log.prototype.appendLastEvent = function(obj) {
  var event = this._log.events[this._log.events.length - 1];
  if(!event) return;
  for(var key in obj) {
    event[key] = obj[key];
  }
};

/**
  Checks if the last event has the same players as those given. Useful to check if the medic_death line has come before or after a kill.
  @param playerSteamid steamid of the player (attacker)
  @param victimSteamid steamid of the victim
*/
Log.prototype.doesLastEventMatchPlayers = function(playerSteamid, victimSteamid) {
  var event = this._log.events[this._log.events.length - 1];
  if(!event) return false;

  return (event.player && event.player.steamid && event.player.steamid == playerSteamid
  && event.victim && event.victim.steamid && event.victim.steamid == victimSteamid);
};

/*********************************
  Functions for maintaining Players.
*/

/**
  Gets a player by their steamid. This reference can then edit the array, so be careful!
  PRIVATE - because this can mutate the array if you are not careful, this getter is private.
  @param steamid string of the steamid of the player.
*/
Log.prototype._getPlayer = function(steamid) {
  if(!steamid) return false;

  var foundPlayer = false;

  for(var p in this._log.players) {
    if(this._log.players[p].steamid == steamid) {
      foundPlayer = this._log.players[p];
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
Log.prototype.addUpdatePlayer = function(player, isInMatch, online) {
  if(!player) return;
  if(online === undefined) online = true;

  var foundPlayer = this._getPlayer(player.steamid);

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
      joinedGame: this._log.gameStartTimestamp,
      role: false,
      damage: 0,
      online: online,
      kills: 0,
      deaths: 0,
      assists: 0,
      longestKillStreak: 0,
      longestDeathStreak: 0,
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
      position: {},
      roleSpread: {},
      itemSpread: {},
      healSpread: {},
      weaponSpread: {},
      playerSpread: {},
      isInMatch: isInMatch
    }
    this._log.players.push(newPlayer);

    //initializing player where needed
    this._scratch.numKills[player.steamid] = 0;
    this._scratch.numDeaths[player.steamid] = 0;
    this._scratch.roleStart[player.steamid] = this._log.gameStartTimestamp;
  } else {
    foundPlayer.name = player.name;
    foundPlayer.userid = player.userid; //player leaves server and rejoins to get new id?
    foundPlayer.team = player.team;
    foundPlayer.online = online;
    foundPlayer.isInMatch = isInMatch;

    if(!foundPlayer.joinedGame) foundPlayer.joinedGame = this._log.gameStartTimestamp;
  }
};

/**
  Sets the position of the player from the log_verbose_enable position_report line.
  @param steamid string representing the steamid of the player
  @param position object as retrieved from ParsingUtils#getCoords
*/
Log.prototype.setPlayerPosition = function(steamid, position) {
  if(!steamid || !position) return;

  var foundPlayer = this._getPlayer(steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  foundPlayer.position = position;
};

/**
  Sets the time when the player joined the game
  @param steamid string representing the steamid of the player
  @param timestamp Date object of when the user joined
*/
Log.prototype.setPlayerJoinedGame = function(steamid, timestamp) {
  if(!steamid || !timestamp) return;

  var foundPlayer = this._getPlayer(steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  foundPlayer.joinedGame = timestamp;
  this._scratch.roleStart[steamid] = timestamp;
};

/**
  Removes a player from the log object.
  @param player single player object retrieved from ParsingUtils#getPlayers.
*/
Log.prototype.removePlayer = function(player) {
  if(!player) return;

  var foundPlayer = this._getPlayer(player.steamid);
  if(foundPlayer === false) return;

  this._log.players.splice(this._log.players.indexOf(foundPlayer), 1);
};

/**
  remove isInMatch == false players, and then the property from all players.
*/
Log.prototype.pruneNotInMatch = function() {
  var playersToRemove = []; //storing players to be removed later.
  for(var p in this._log.players) {

    if(this._log.players[p].isInMatch === false) {
      //if player is not marked as in match, remove player.
      playersToRemove.push(this._log.players[p]);
    } else {
      delete this._log.players[p].isInMatch;
    }
  }

  for(var p in playersToRemove) {
    this.removePlayer(playersToRemove[p]);
  }
};

/**
  Adds a role to the player.
  @param player single player object retrieved from ParsingUtils#getPlayers.
  @param role string of role to add to user.
*/
Log.prototype.addUpdateRoleToPlayer = function(player, role, timestamp) {
  if(!player || !role || !timestamp) return;

  var foundPlayer = this._getPlayer(player.steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+player.steamid);

  if(foundPlayer.roleSpread[role.key] === undefined) {
    foundPlayer.roleSpread[role.key] = {
      key: role.key,
      name: role.name,
      secondsPlayed: 0
    };
  }

  this._updateRoleSecondsPlayedToPlayer(foundPlayer, timestamp);

  //if we are now setting a role for this player,
  //go back through the events and update the role.
  if(!foundPlayer.role) {
    this._updateRoleToEvents(player.steamid, role);
  }

  foundPlayer.role = role; //setting the current role
};

/**
  Function will update how long the player has been at his current role.
  @param foundPlayer player object retrieved from this._getPlayer() (commonly called foundPlayer)
  @param timestamp the current line's timestamp.
*/
Log.prototype._updateRoleSecondsPlayedToPlayer = function(foundPlayer, timestamp) {

  if(!this._scratch.roleStart[foundPlayer.steamid]) this._scratch.roleStart[foundPlayer.steamid] = foundPlayer.joinedGame;
  if(!foundPlayer.role) return; //no role yet

  foundPlayer.roleSpread[foundPlayer.role.key].secondsPlayed += parsingUtils.getTimestampDifference(timestamp, this._scratch.roleStart[foundPlayer.steamid]);

  this._scratch.roleStart[foundPlayer.steamid] = timestamp;
};

/**
  Function to be called at the end of parsing a line. It will update how many seconds each user has been at their role.
  @param timestamp the current line's timestamp
*/
Log.prototype.updateRoleSecondsPlayedForAllPlayers = function(timestamp) {
  for(var p in this._log.players) {
    var foundPlayer = this._log.players[p];
    if(foundPlayer.online && (foundPlayer.team == 'Blue' || foundPlayer.team == 'Red')) {
      //player is still in the server and on a team
      this._updateRoleSecondsPlayedToPlayer(foundPlayer, timestamp);
    }
  }
};

/**
  Convenience function to add a role property to the given player object and return it.
  Note - this does not modify the players array in the resulting object, just the player info
  object passed in.
  @param player player object to give a role to.
*/
Log.prototype._addRoleInfoToPlayerObject = function(player) {
  var foundPlayer = this._getPlayer(player.steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+player.steamid);
  player.role = foundPlayer.role;
  return player;
}

/**
  Increments the given stat for the player.
  @param steamid string representing the steamid of the player
  @param statToIncrement property on object in players array to increment (ie. damage)
  @param customKill can be false or the custom_kill paren value from a kill. If set to headshot or bodyshot, this method will increment those properties as well.
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementStatToPlayer = function(steamid, statToIncrement, customKill, increment) {
  if(!steamid || !statToIncrement) return;
  if(increment === 0) return;

  if(!increment) increment = 1;

  var foundPlayer = this._getPlayer(steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  if(statToIncrement == 'kills') {
    //increment this player's count of kills from last death
    this._scratch.numKills[steamid] += increment;

    //if our current kill streak is greater than the player stat's value, set it to the new one.
    if(this._scratch.numKills[steamid] > foundPlayer.longestKillStreak) foundPlayer.longestKillStreak = this._scratch.numKills[steamid];

    this._scratch.numDeaths[steamid] = 0; //reset

    if(customKill == 'headshot') {
      foundPlayer['headshots'] += increment;
    } else if(customKill == 'backstab') {
      foundPlayer['backstabs'] += increment;
    }
  } else if(statToIncrement == 'deaths') {
    //increment this player's count of deaths from last kill
    this._scratch.numDeaths[steamid] += increment;

    //if our current kill streak is greater than the player stat's value, set it to the new one.
    if(this._scratch.numDeaths[steamid] > foundPlayer.longestDeathStreak) foundPlayer.longestDeathStreak = this._scratch.numDeaths[steamid];

    this._scratch.numKills[steamid] = 0; //reset
  }

  //handle actual given stat
  if(foundPlayer[statToIncrement] !== undefined) foundPlayer[statToIncrement] += increment;
  else throw new Error("player does not have the property: "+statToIncrement);
};

/**
  Increments the given weapon spread for the player.
  @param steamid string representing the steamid of the player
  @param weapon_key the key name of the weapon used to kill the victim
  @param statToIncrement property on object in players array to increment (ie. kills)
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementWeaponSpreadToPlayer = function(steamid, weapon_key, statToIncrement, increment) {
  if(!steamid || !weapon_key || !statToIncrement) return;
  else if(statToIncrement != 'kills' && statToIncrement != 'deaths') throw new Error("Invalid statToIncrement given: "+statToIncrement);
  else if(increment === 0) return;

  if(!increment) increment = 1;

  var foundPlayer = this._getPlayer(steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  if(foundPlayer.weaponSpread[weapon_key] === undefined) {
    foundPlayer.weaponSpread[weapon_key] = {
      key: weapon_key,
      kills: 0,
      deaths: 0
    };
  }

  foundPlayer.weaponSpread[weapon_key][statToIncrement] += increment;
};

/**
  Increments the given player spread for the player.
  Example: want to record that Target got 1 kill on Barncow. playerSteamid would be Target's steamid, and then pass in Barncow's player object, along with 'kills' as statToIncrement.
  @param playerSteamid string representing the steamid of the player to update
  @param playerSpreadPlayer full player object to record k/d by the player represented in playerSteamid
  @param statToIncrement property on object in players array to increment (ie. kills)
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementPlayerSpreadToPlayer = function(playerSteamid, playerSpreadPlayer, statToIncrement, increment) {
  if(!playerSteamid || !playerSpreadPlayer || !statToIncrement) return;
  else if(statToIncrement != 'kills' && statToIncrement != 'deaths') throw new Error("Invalid statToIncrement given: "+statToIncrement);
  else if(increment === 0) return;

  if(!increment) increment = 1;

  var foundPlayer = this._getPlayer(playerSteamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+playerSteamid);

  if(foundPlayer.playerSpread[playerSpreadPlayer.steamid] === undefined) {
    foundPlayer.playerSpread[playerSpreadPlayer.steamid] = {
      name: playerSpreadPlayer.name, //only copying name and steamid to prevent having to constantly update other attributes that may not be necessary at this level.
      steamid: playerSpreadPlayer.steamid,
      kills: 0,
      deaths: 0
    };
  }

  foundPlayer.playerSpread[playerSpreadPlayer.steamid][statToIncrement] += increment;
};

/**
  Adds an item to the player, such as "medkit_small".
  @param steamid string representing the steamid of the player
  @param item string of the item name (ie. "medkit_small")
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementItemSpreadToPlayer = function(steamid, item, increment) {
  if(!steamid || !item) return;
  if(increment === 0) return;

  if(!increment) increment = 1;

  var foundPlayer = this._getPlayer(steamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  if(foundPlayer.itemSpread[item] === undefined) foundPlayer.itemSpread[item] = increment;
  else foundPlayer.itemSpread[item] += increment;
};

/**
  Adds heal spread statistics (who healed whom for how much) to a player
  Note - The supplemental stats plugin also tracks healing done by engineers from dispensers.
  @param healerSteamid string representing the steamid of the player doing the healing
  @param patientPlayer single player object retrieved from ParsingUtils#getPlayers of the person being healed.
  @param increment Optional. If not specified, the given stat is incremented by 1. Otherwise, the value given here is added to the stat specified.
*/
Log.prototype.incrementHealSpreadToPlayer = function(healerSteamid, patientPlayer, increment) {
  if(!healerSteamid || !patientPlayer) return;
  if(increment === 0) return;

  if(!increment) increment = 1;

  var foundPlayer = this._getPlayer(healerSteamid);
  if(foundPlayer === false) throw new Error("Could not find player: "+steamid);

  if(foundPlayer.healSpread[patientPlayer.steamid] === undefined) {
    foundPlayer.healSpread[patientPlayer.steamid] = {
      name: patientPlayer.name, //only copying name and steamid to prevent having to constantly update other attributes that may not be necessary at this level.
      steamid: patientPlayer.steamid,
      healing: 0
    };
  }

  foundPlayer.healSpread[patientPlayer.steamid]['healing'] += increment;
};

module.exports = Log;