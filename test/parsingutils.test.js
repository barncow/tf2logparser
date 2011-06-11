var should = require('should'),
  parsingUtils = require('../lib/parsingutils'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = {
  'getTimestamp sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine).should.eql({
      month: 3,
      day: 27,
      year: 2011,
      hour: 18,
      minute: 0,
      second: 8
    });
  },
  
  'getTimestamp returns false for corrupt value': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine.substring(0, 10)).should.not.be.ok;
  },
  
  'getLogLineDetails sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine).should.eql('"Console<0><Console><Console>" say "fresh prince of bel air"');
  },
  
  'getLogLineDetails on corrupt string returns false': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine.substring(0, 10)).should.not.be.ok;
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
    parser.readFile(FP+'/blah.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;
    });
    
    parser.readFile(FP+'/line_initialline.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      
      //using incorrect line type
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;
      
      //sunny case
      parsingUtils.isLogLineOfType(details, "Log file started").should.be.ok;
    });
  },
  
  'scrubLogLine sunny cases': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_initialline.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/255.255.255.255-27015/srcds_l/orangebox/tf") (version "4317")');
    });
    
    parser.readFile(FP+'/line_rcon.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: rcon from "255.255.255.255:50039": command "exec cevo_stopwatch.cfg"');
    });
    
    parser.readFile(FP+'/line_player_connected.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:06:32: "Cres<49><STEAM_0:0:8581157><>" connected, address "255.255.255.255:27005"');
    });
  },
  
  'scrubLogLine with no IP - should just return the line unchanged': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_console_say.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: "Console<0><Console><Console>" say ""CEVO TF2 stopwatch config file loaded. 08/14/10""');
    });
  },
  
  'getPlayerLineAction': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_console_say.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('say');
    });
    
    parser.readFile(FP+'/line_player_enteredgame.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('entered the game');
    });
    
    parser.readFile(FP+'/line_player_kill.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('killed');
    });
    
    parser.readFile(FP+'/line_player_disconnected.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('disconnected');
    });
    
    parser.readFile(FP+'/line_player_connected.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('connected, address');
    });
    
    parser.readFile(FP+'/line_player_picked_item.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineAction(details).should.eql('picked up item');
    });
  },
  
  'getPlayerLineActionDetail': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_player_jointeam.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('Blue');
    });
    
    parser.readFile(FP+'/line_player_triggered_killassist.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('kill assist');
    });
    
    parser.readFile(FP+'/line_player_changerole.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('scout');
    });
    
    parser.readFile(FP+'/line_player_teamsay.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getPlayerLineActionDetail(details).should.eql('I can also play pyro. I have been doing that a lot on 2fort and doublecross.');
    });
  },
  
  'getParenValue': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_player_triggered_medicdeath.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getParenValue(details, 'ubercharge').should.eql('0');
      parsingUtils.getParenValue(details, 'bunnies').should.not.be.ok;
    });
    
    parser.readFile(FP+'/line_player_jointeam.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getParenValue(details, 'ubercharge').should.not.be.ok;
    });
  },
  
  'didMedicDieWithUber': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_player_triggered_medicdeath.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.not.be.ok;
    });
    
    parser.readFile(FP+'/line_player_triggered_medicdeath_withuber.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.be.ok;
    });
    
    parser.readFile(FP+'/line_player_jointeam.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.didMedicDieWithUber(details).should.not.be.ok;
    });
  },
  
  'getWorldTriggerAction': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_world_triggered_roundstart.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWorldTriggerAction(details).should.eql("Round_Start");
    });
  },
  
  'getTeamFromTeamLine': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_currentscore.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamFromTeamLine(details).should.eql("Red");
    });
  },
  
  'getTeamAction': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_triggered_pointcaptured.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamAction(details).should.eql("triggered");
    });
  },
  
  'getTeamTriggerAction': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_triggered_pointcaptured.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamTriggerAction(details).should.eql("pointcaptured");
    });
  },
  
  'getTeamScore': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_currentscore.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamScore(details).should.eql(0);
    });
    
    parser.readFile(FP+'/line_team_finalscore_9players.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamScore(details).should.eql(2);
    });
  },
  
  'getTeamNumberPlayers': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_currentscore_noplayers.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(0);
    });
    
    parser.readFile(FP+'/line_team_currentscore.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(6);
    });
    
    parser.readFile(FP+'/line_team_finalscore_9players.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getTeamNumberPlayers(details).should.eql(9);
    });
  },
  
  'getServerCvarName': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_servercvar.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getServerCvarName(details).should.eql('mp_falldamage');
    });
  },
  
  'getServerCvarValue': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_servercvar.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getServerCvarValue(details).should.eql(0);
    });
  },
  
  'getWeapon': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_player_kill.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('scattergun');
    });
    
    parser.readFile(FP+'/line_player_suicide_rocket.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('tf_projectile_rocket');
    });
    
    parser.readFile(FP+'/line_player_killed_pistolscout.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('pistol_scout');
    });
    
    parser.readFile(FP+'/line_player_triggered_weaponstats_superlogs.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getWeapon(details).should.eql('scattergun');
    });
  },
  
  'getKillCoords': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_player_kill.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getKillCoords(details, 'attacker').should.eql('-704 1584 -464');
      parsingUtils.getKillCoords(details, 'victim').should.eql('-824 1429 -396');
    });
  },
  
  'getCapturePointName': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_team_triggered_pointcaptured.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getCapturePointName(details).should.eql('#Gravelpit_cap_A');
    });
    
    parser.readFile(FP+'/line_team_triggered_pointcaptured_steel.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getCapturePointName(details).should.eql('Cap A, The front door dock');
    });
  },
  
  'getHealing': function() {
    var parser = LogParser.create();
    
    //NOTE - using .equal instead of .eql to ensure that we are getting numbers, not strings.
    
    parser.readFile(FP+'/line_player_triggered_medicdeath.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(160);
    });
    
    parser.readFile(FP+'/line_player_triggered_healed_superlogs.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(510);
    });
    
    parser.readFile(FP+'/line_player_triggered_healed.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(72);
    });
    
    parser.readFile(FP+'/line_player_triggered_healed_v2.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.getHealing(details).should.equal(72);
    });
  }
}
