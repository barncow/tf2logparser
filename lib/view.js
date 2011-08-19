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
    var cell = [
      player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid}
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
    table.tbody.push(cell);
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
module.exports.medicStats = function(players, playableSeconds) {
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
    if(typeof player.roleSpread.medic === 'undefined') return; //only want medics

    var cell = [
      player.team
      , {name: player.name, steamid: player.steamid, friendid: player.friendid}
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
    table.tbody.push(cell);
  });

  table.tbody.sort(function(a, b) {
    var medSummation = function(p) {
      return p[2]+p[3]-p[4]+p[5]+p[6]+p[7]+p[8]+p[9]-p[10]+p[11]+p[12]+p[13]+p[14];
    };
    return medSummation(b) - medSummation(a) //sort descending, better medic at the top.
  });

  return table;
};