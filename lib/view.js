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
  else return (num/den).toFixed(3);
};