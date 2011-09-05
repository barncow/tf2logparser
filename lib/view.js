var WeaponList = require('./weaponlist');

//TODO sort these where necessary
//TODO capture point times

/**
  Retrieves the main player stat table for the given array of players from the main log object.
  @param players The players array from the generated log object
  @param playableSeconds the playableSeconds value from the main log object
*/
module.exports.playerStats = function(players, playableSeconds) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Name"}
      , {acronym: "C", full: "Classes Played"}
      , {acronym: "K", full: "Kills"}
      , {acronym: "A", full: "Assists"}
      , {acronym: "D", full: "Deaths"}
      , {acronym: "KAPD", full: "Kills+Assists/Death"}
      , {acronym: "KAPM", full: "Kills+Assists/Minute"}
      , {acronym: "DA", full: "Damage Dealt"}
      , {acronym: "DAPD", full: "Damage/Death"}
      , {acronym: "DAPM", full: "Damage/Minute"}
      , {acronym: "TMP", full: "Total Medic Picks"}
      , {acronym: "MPDU", full: "Medic Picks with a Dropped Uber"}
      , {acronym: "LKS", full: "Longest Kill Streak"}
      , {acronym: "LDS", full: "Longest Death Streak"}
      , {acronym: "HS", full: "Headshots"}
      , {acronym: "BS", full: "Backstabs"}
      , {acronym: "CPB", full: "Capture Points Blocked"}
      , {acronym: "CPC", full: "Capture Points Captured"}
      , {acronym: "ID", full: "Intel Defenses"}
      , {acronym: "IC", full: "Intel Captures"}
      , {acronym: "DOM", full: "Dominations"}
      , {acronym: "TDM", full: "Times Dominated"}
      , {acronym: "R", full: "Revenges"}
      , {acronym: "E", full: "Extinguishes"}
    ]
    , tbody: []
  }

  //populate the tbody with data
  players.forEach(function(player, index, array) {
    var row = [
      player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team}
      , player.roleSpread
      , player.kills
      , player.assists
      , player.deaths
      , division(player.kills+player.assists, player.deaths)
      , division(player.kills+player.assists, playableSeconds/60) //we want minutes
      , player.damage
      , division(player.damage, player.deaths)
      , division(player.damage, playableSeconds/60) //we want minutes
      , player.medPicksTotal
      , player.medPicksDroppedUber
      , player.longestKillStreak
      , player.longestDeathStreak
      , player.headshots
      , player.backstabs
      , player.pointCaptureBlocks
      , player.pointCaptures
      , player.flagDefends
      , player.flagCaptures
      , player.dominations
      , player.timesDominated
      , player.revenges
      , player.extinguishes
    ];
    table.tbody.push(row);
  });

  return table;
};

/**
  Calculates the division. If the denominator is zero, then the numerator is returned.
  @param num the top part of the division (kills+assists)
  @param den the bottom part of the division (deaths or minutes)
*/
var division = module.exports.division = function(num, den) {
  if(den === 0) return num;
  else return parseFloat((num/den).toFixed(3));
};

/**
  Retrieves the relevant medic stats for the players that have time as medic
  @param players The players array from the generated log object
  @param playableSeconds the playableSeconds value from the main log object
*/
module.exports.medicSpread = function(players, playableSeconds) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Name"}
      , {acronym: "K", full: "Kills"}
      , {acronym: "A", full: "Assists"}
      , {acronym: "D", full: "Deaths"}
      , {acronym: "KAPD", full: "Kills+Assists/Death"}
      , {acronym: "KAPM", full: "Kills+Assists/Minute"}
      , {acronym: "U", full: "Ubers"}
      , {acronym: "UPD", full: "Ubers/Death"}
      , {acronym: "UPM", full: "Ubers/Minute"}
      , {acronym: "DU", full: "Dropped Ubers"}
      , {acronym: "H", full: "Healing"}
      , {acronym: "HPD", full: "Healing/Death"}
      , {acronym: "HPM", full: "Healing/Minute"}
      , {acronym: "E", full: "Extinguishes"}
    ]
    , tbody: []
  }

  //populate the tbody with data
  players.forEach(function(player, index, array) {
    if(!player.roleSpread) return; //no rolespread, move on to next player
    if(typeof player.roleSpread.medic === 'undefined') return; //only want medics

    var row = [
      player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team}
      , player.kills
      , player.assists
      , player.deaths
      , division(player.kills+player.assists, player.deaths)
      , division(player.kills+player.assists, playableSeconds/60) //we want minutes
      , player.ubers
      , division(player.ubers, player.deaths)
      , division(player.ubers, playableSeconds/60) //we want minutes
      , player.droppedUbers
      , player.healing
      , division(player.healing, player.deaths)
      , division(player.healing, playableSeconds/60) //we want minutes
      , player.extinguishes
    ];
    table.tbody.push(row);
  });

  table.tbody.sort(function(a, b) {
    var medSummation = function(p) {
      return p[2]+p[3]-p[4]+p[5]+p[6]+p[7]+p[8]+p[9]-p[10]+p[11]+p[12]+p[13]+p[14];
    };
    return medSummation(b) - medSummation(a) //sort descending, better medic at the top.
  });

  return table;
};

/**
  Retrieves the heal spread for the players that have these stats (medics and engineers)
  @param players The players array from the generated log object
*/
module.exports.healSpread = function(players) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Patient"}
    ]
    , tbody: []
  }

  //find our healers
  var healers = [];
  players.forEach(function(player, index, array) {
    if(!player.healSpread || Object.keys(player.healSpread).length === 0) return; //only want players that have healed
    else {
      healers.push(player);
      table.thead.push({name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team});
    }
  });

  //for each of our players, output the healing done by each healer
  players.forEach(function(player, index, array) {
    var row = [
        player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team}
    ];

    healers.forEach(function(healer, hindex, harray) {
      if(typeof healer.healSpread[player.steamid] === 'undefined') row.push(0); //healer did no healing of this player
      else row.push(healer.healSpread[player.steamid].healing); //healer did heal this person, add the healing amount
    });

    table.tbody.push(row);
  });

  return table;
};

/**
  Retrieves weapon kills/deaths for each players
  @param players The players array from the generated log object
  @param weapons The weapons array from the generated log object
*/
module.exports.weaponSpread = function(players, weapons) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Name"}
    ]
    , tbody: []
  }
  
  //add headers for full weapon information
  weapons.forEach(function(weapon, index, array) {
    table.thead.push(WeaponList.findWeapon(weapon));
  });

  //for each of our players, output the stats for each weapon
  players.forEach(function(player, index, array) {
    if(!player.weaponSpread) return; //no weaponSpread, move on to next player
    var row = [
        player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team}
    ];

    weapons.forEach(function(weapon, hindex, harray) {
      var weaponStat = player.weaponSpread[weapon];
      if(typeof weaponStat === 'undefined') row.push({kills: 0, deaths: 0}); //no stats, default zeroes
      else row.push({kills: weaponStat.kills, deaths: weaponStat.deaths});
    });

    table.tbody.push(row);
  });

  return table;
};

/**
  Retrieves the player spread - the matrix of each player's kills/deaths vs. other players
  @param players The players array from the generated log object
*/
module.exports.playerSpread = function(players) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Name"}
    ]
    , tbody: []
  }

  //add all players to thead
  players.forEach(function(player, index, array) {
    table.thead.push({name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team, team: player.team});
  });

  //for each of our players, output the killing done to each player
  players.forEach(function(rowPlayer, rowIndex, rowArray) {
    var row = [
        rowPlayer.team
      , {name: rowPlayer.name, steamid: rowPlayer.steamid, friendid: rowPlayer.friendid, team: rowPlayer.team}
    ];

    players.forEach(function(colPlayer, colIndex, colArray) {
      if(!colPlayer.playerSpread || typeof colPlayer.playerSpread[rowPlayer.steamid] === 'undefined') row.push(0); //row player did not kill this column player
      else row.push(colPlayer.playerSpread[rowPlayer.steamid].deaths); //row player killed column player, add count
    });

    table.tbody.push(row);
  });

  return table;
};

/**
  Retrieves what players picked up what items
  @param players The players array from the generated log object
*/
module.exports.itemSpread = function(players) {
  var table = {
    thead: [
        {acronym: "T", full: "Team"}
      , {acronym: null, full: "Name"}
    ]
    , tbody: []
  }

  //find the items used
  var items = {};
  players.forEach(function(player, index, array) {
    if(!player.itemSpread) return; //only want players that have picked up items

    playerItems = Object.keys(player.itemSpread);
    if(playerItems.length === 0) return; //only want players that have picked up items
    
    playerItems.forEach(function(item, itemIndex, itemArray) {
      items[item] = true;
    });
  });
  items = Object.keys(items);
  table.thead = table.thead.concat(items); //add item columns to header

  //for each of our players, output the healing done by each healer
  players.forEach(function(player, index, array) {
    var row = [
        player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid, team: player.team}
    ];

    items.forEach(function(item, itemIndex, itemArray) {
      if(!player.itemSpread || typeof player.itemSpread[item] === 'undefined') row.push(0); //player did not pick up this item
      else row.push(player.itemSpread[item]); //player picked up item, add its count
    });

    table.tbody.push(row);
  });

  return table;
};

/**
  Retrieves the chat events
  @param events The events array from the generated log object
*/
module.exports.chatLog = function(events) {
  var table = {
    thead: ["Elapsed Time", "Name", "Message"]
    , tbody: []
  }

  //for each of our events, try to find the chat related ones
  events.forEach(function(e, index, array) {
    if(e.type !== 'say' && e.type !== 'say_team') return; //only want chats

    var row = [
        e.elapsedSeconds
      , {name: e.player.name, steamid: e.player.steamid, team: e.player.team}
      , {text: e.text, type: e.type}
    ];

    table.tbody.push(row);
  });

  return table;
};