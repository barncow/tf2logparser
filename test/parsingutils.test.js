var should = require('should')
  , parsingUtils = require('parsingutils')
  , LogParser = require('tf2logparser')
  , ReadFile = require('readfile')
  , FIXTURE_PATH = FP = './test/fixtures'
  , onError = function(rf) { //function that takes a ReadFile instance and adds the error handler to it
    rf.on('error', function(err){throw err;});
  };

module.exports = {
  'getTimestamp sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine).should.eql(new Date(2011, 2, 27, 18, 0, 8, 0));
  },

  'getTimestamp returns false for corrupt value': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine.substring(0, 10)).should.not.be.ok;
  },

  'getTimestampDifference': function() {
    parsingUtils.getTimestampDifference(new Date(2011, 2, 1, 12, 0, 0, 0), new Date(2011, 1, 28, 12, 0, 0, 0)).should.equal(60*60*24);
  },

  'getLogLineDetails sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine).should.eql('"Console<0><Console><Console>" say "fresh prince of bel air"');
  },

  'getLogLineDetails on corrupt string returns false': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine.substring(0, 10)).should.not.be.ok;
  },

  'getLogLineDetails should return data': function() {
    var parser = LogParser.create();
    var lineToView = 2; //1 indexed
    var lineIndex = 1;
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      if(lineIndex == lineToView) {
        parsingUtils.getLogLineDetails(line).should.eql('"Console<0><Console><Console>" say ""UGC HL TF2 beta Standard cfg v.06-20-11 executed, reload map once before start""');
      }
      ++lineIndex;
    });
    onError(rf);
    rf.readFile(FP+'/freight_vs_mixup.log');
  },

  'getMap returns values for sunny case': function() {
    var loadingMapLine = 'L 04/03/2011 - 15:20:36: Loading map "ctf_2fort"';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(loadingMapLine)).should.eql('ctf_2fort');

    var startingMapLine = 'L 04/03/2011 - 15:20:36: Started map "ctf_impact2" (CRC "1634099807")';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(startingMapLine)).should.eql('ctf_impact2');

    var currentMapLine = 'L 04/03/2011 - 15:20:36: Current map "ctf_doublecross" ';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(currentMapLine)).should.eql('ctf_doublecross');
  },

  'getMap returns false for corrupt string': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(logLine)).should.not.be.ok;
  },

  'isLogLineOfType (both cases because we are reading from files)': function() {
    var parser = LogParser.create();

    //garbage data
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;
    });
    onError(rf);
    rf.readFile(FP+'/blah.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);

      //using incorrect line type
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;

      //sunny case
      parsingUtils.isLogLineOfType(details, "Log file started").should.be.ok;
    });
    onError(rf2);
    rf2.readFile(FP+'/line_initialline.log');
  },

  'scrubLogLine sunny cases': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/255.255.255.255-27015/srcds_l/orangebox/tf") (version "4317")');
    });
    onError(rf);
    rf.readFile(FP+'/line_initialline.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('');
    });
    onError(rf2);
    rf2.readFile(FP+'/line_rcon.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('');
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_say_sourcemod_command.log');

    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('');
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_say_sourcemod_command_priv.log');

    var rf5 = ReadFile.create();
    rf5.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:06:32: "Cres<49><STEAM_0:0:8581157><>" connected, address "255.255.255.255:27005"');
    });
    onError(rf5);
    rf5.readFile(FP+'/line_player_connected.log');
  },

  'scrubLogLine with no IP - should just return the line unchanged': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: "Console<0><Console><Console>" say ""CEVO TF2 stopwatch config file loaded. 08/14/10""');
    });
    onError(rf);
    rf.readFile(FP+'/line_console_say.log');
  },

  'getPlayerLineAction': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('say');
    });
    onError(rf);
    rf.readFile(FP+'/line_console_say.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('entered the game');
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_enteredgame.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('killed');
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_kill.log');

    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('disconnected');
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_disconnected.log');

    var rf5 = ReadFile.create();
    rf5.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('connected, address');
    });
    onError(rf5);
    rf5.readFile(FP+'/line_player_connected.log');

    var rf6 = ReadFile.create();
    rf6.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('picked up item');
    });
    onError(rf6);
    rf6.readFile(FP+'/line_player_picked_item.log');
  },

  'getPlayerLineActionDetail': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('Blue');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_jointeam.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('kill assist');
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_triggered_killassist.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('scout');
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_changerole.log');

    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('I can also play pyro. I have been doing that a lot on 2fort and doublecross.');
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_teamsay.log');

    //make sure to grab all characters from say
    var rf5 = ReadFile.create();
    rf5.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('"CEVO TF2 stopwatch config file loaded. 08/14/10"');
    });
    onError(rf5);
    rf5.readFile(FP+'/line_console_say.log');
  },

  'getParenValue': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getParenValue(details, 'ubercharge').should.eql('0');
      parsingUtils.getParenValue(details, 'bunnies').should.not.be.ok;
    });
    onError(rf);
    rf.readFile(FP+'/line_player_triggered_medicdeath.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getParenValue(details, 'ubercharge').should.not.be.ok;
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_jointeam.log');

    //should not be able to get paren type substring (substring must be last portion before value in order to fit the case)
    //TODO Get this working!!
    /*
    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getParenValue(details, 'position').should.not.be.ok;
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_kill.log');
    */
  },

  'didMedicDieWithUber': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.not.be.ok;
    });
    onError(rf);
    rf.readFile(FP+'/line_player_triggered_medicdeath.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.be.ok;
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_triggered_medicdeath_withuber.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.not.be.ok;
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_jointeam.log');
  },

  'getWorldTriggerAction': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWorldTriggerAction(details).should.eql("Round_Start");
    });
    onError(rf);
    rf.readFile(FP+'/line_world_triggered_roundstart.log');
  },

  'getTeamFromTeamLine': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamFromTeamLine(details).should.eql("Red");
    });
    onError(rf);
    rf.readFile(FP+'/line_team_currentscore.log');
  },

  'getTeamAction': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamAction(details).should.eql("triggered");
    });
    onError(rf);
    rf.readFile(FP+'/line_team_triggered_pointcaptured.log');
  },

  'getTeamTriggerAction': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamTriggerAction(details).should.eql("pointcaptured");
    });
    onError(rf);
    rf.readFile(FP+'/line_team_triggered_pointcaptured.log');
  },

  'getTeamScore': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamScore(details).should.equal(0);
    });
    onError(rf);
    rf.readFile(FP+'/line_team_currentscore.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamScore(details).should.equal(2);
    });
    onError(rf2);
    rf2.readFile(FP+'/line_team_finalscore_9players.log');
  },

  'getTeamNumberPlayers': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(0);
    });
    onError(rf);
    rf.readFile(FP+'/line_team_currentscore_noplayers.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(6);
    });
    onError(rf2);
    rf2.readFile(FP+'/line_team_currentscore.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(9);
    });
    onError(rf3);
    rf3.readFile(FP+'/line_team_finalscore_9players.log');
  },

  'getServerCvarName': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getServerCvarName(details).should.eql('mp_falldamage');
    });
    onError(rf);
    rf.readFile(FP+'/line_servercvar.log');
  },

  'getServerCvarValue': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getServerCvarValue(details).should.eql(0);
    });
    onError(rf);
    rf.readFile(FP+'/line_servercvar.log');
  },

  'getWeapon': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('scattergun');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_kill.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('tf_projectile_rocket');
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_suicide_rocket.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('pistol_scout');
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_killed_pistolscout.log');

    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('scattergun');
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_triggered_weaponstats_superlogs.log');
  },

  'getCoords': function() {
    parsingUtils.getCoords("136 733 -183").should.eql({x: 136, y: 733, z: -183});
    parsingUtils.getCoords("136 73").should.not.be.ok;
  },

  'getKillCoords': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getKillCoords(details, 'attacker').should.eql({x: -704, y: 1584, z: -464});
      parsingUtils.getKillCoords(details, 'victim').should.eql({x: -824, y: 1429, z: -396});
    });
    onError(rf);
    rf.readFile(FP+'/line_player_kill.log');
  },

  'getReportedPosition': function() {
    //sunny case
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getReportedPosition(details).should.eql({x: -1862, y: 1217, z: -244});
    });
    onError(rf);
    rf.readFile(FP+'/line_player_position.log');

    //incorrect line
    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      //parsingUtils.getReportedPosition(details).should.not.be.ok; //todo make this pass
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_kill.log');
  },

  'getCapturePointName': function() {
    var parser = LogParser.create();

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getCapturePointName(details).should.eql('#Gravelpit_cap_A');
    });
    onError(rf);
    rf.readFile(FP+'/line_team_triggered_pointcaptured.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getCapturePointName(details).should.eql('Cap A, The front door dock');
    });
    onError(rf2);
    rf2.readFile(FP+'/line_team_triggered_pointcaptured_steel.log');
  },

  'getHealing': function() {
    //NOTE - using .equal instead of .eql to ensure that we are getting numbers, not strings.

    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(160);
    });
    onError(rf);
    rf.readFile(FP+'/line_player_triggered_medicdeath.log');

    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(510);
    });
    onError(rf2);
    rf2.readFile(FP+'/line_player_triggered_healed_superlogs.log');

    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(72);
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_triggered_healed.log');

    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(72);
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_triggered_healed_v2.log');
  },

  'getDamage': function() {
    //NOTE - using .equal instead of .eql to ensure that we are getting numbers, not strings.

    //superlogs damage
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getDamage(details).should.equal(375);
    });
    onError(rf);
    rf.readFile(FP+'/line_player_triggered_weaponstats_superlogs.log');

    //cinq's damage v1
    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getDamage(details).should.equal(11);
    });
    onError(rf2);
    rf2.readFile(FP+'/line_cinq_damage_v1.log');

    //cinq's damage v2 - changed so that damage is not "naked"
    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getDamage(details).should.equal(11);
    });
    onError(rf3);
    rf3.readFile(FP+'/line_cinq_damage_v2.log');
  },

  'getFlagEvent': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getFlagEvent(details).should.eql('defended');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_triggered_flagevent_defended.log');
  },

  'getRoundWinTeam': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getRoundWinTeam(details).should.eql('Red');
    });
    onError(rf);
    rf.readFile(FP+'/line_world_triggered_roundwin.log');
  },

  'getCustomKill': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getCustomKill(details).should.eql('headshot');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_kill_headshot.log');
  },

  'getObjectFromBuiltObject': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getObjectFromBuiltObject(details).should.eql('OBJ_ATTACHMENT_SAPPER');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_attach_sapper.log');
  },

  'getPickedUpItemKeyName': function() {
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPickedUpItemKeyName(details).should.eql('medkit_small');
    });
    onError(rf);
    rf.readFile(FP+'/line_player_picked_item.log');
  },

  'getPlayers': function() {
    //console performing action
    var rf = ReadFile.create();
    rf.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.not.be.ok;
    });
    onError(rf);
    rf.readFile(FP+'/line_console_say.log');

    //bot performing action
    var rf2 = ReadFile.create();
    rf2.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([{
        name: 'Numnutz',
        userid: 17,
        steamid: 'BOT:Numnutz',
        team: 'Red'
      }]);
    });
    onError(rf2);
    rf2.readFile(FP+'/line_bot_medic.log');

    //player join game, have null team
    var rf3 = ReadFile.create();
    rf3.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([{
        name: 'Target',
        userid: 46,
        steamid: 'STEAM_0:0:6845279',
        team: null
      }]);
    });
    onError(rf3);
    rf3.readFile(FP+'/line_player_enteredgame.log');

    //player joined team, have Unassigned team
    var rf4 = ReadFile.create();
    rf4.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([{
        name: 'Target',
        userid: 46,
        steamid: 'STEAM_0:0:6845279',
        team: 'Unassigned'
      }]);
    });
    onError(rf4);
    rf4.readFile(FP+'/line_player_jointeam.log');

    //player joined server with <> characters in name
    var rf5 = ReadFile.create();
    rf5.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([{
        name: 'Barncow - TF2Logs.com <blah>',
        userid: 2,
        steamid: 'STEAM_0:1:16481274',
        team: null
      }]);
    });
    onError(rf5);
    rf5.readFile(FP+'/line_player_with_restrictedchars_steamid_validated.log');

    //player killed another player, be able to grab both in order.
    var rf6 = ReadFile.create();
    rf6.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([
        {
          name: 'Target',
          userid: 46,
          steamid: 'STEAM_0:0:6845279',
          team: 'Blue'
        },
        {
          name: 'FSTNG! Barncow',
          userid: 48,
          steamid: 'STEAM_0:1:16481274',
          team: 'Red'
        }
      ]);
    });
    onError(rf6);
    rf6.readFile(FP+'/line_player_kill.log');

    var rf7 = ReadFile.create();
    rf7.on('line', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayers(details).should.eql([{
        name: '[H2K]BubbleAlan ʚϊɞ',
        userid: 55,
        steamid: 'STEAM_0:0:556497',
        team: 'Red'
      },
      {
        name: '[H2K]BubbleAlan ʚϊɞ',
        userid: 55,
        steamid: 'STEAM_0:0:556497',
        team: 'Red'
      }]);
    });
    onError(rf7);
    rf7.readFile(FP+'/line_player_triggered_medicdeath.log');
  },

  'convertSteamFriendId': function() {
    parsingUtils.convertSteamFriendId('STEAM_0:1:16481274').should.equal('76561197993228277');
    parsingUtils.convertSteamFriendId('76561197993228277').should.eql('STEAM_0:1:16481274');

    parsingUtils.convertSteamFriendId('sdfsd').should.not.be.ok;
  }
}

