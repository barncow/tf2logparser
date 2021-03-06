var should = require('should')
  , LogParser = require('tf2logparser')
  , FIXTURE_PATH = FP = './test/fixtures'
  , onError = function(ee) { //function that takes a EventEmitter instance and adds the error handler to it
    ee.on('error', function(err){throw err;});
  };

module.exports = {
 '1123dwidgranary': function() {
    //note - this log seems to start in the middle of a round. the first capture by red currently does not count until the "round_start"
    var parser = new LogParser();
    parser.config.ignoreUnrecognizedLines = false;
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(1);
      log.redScore.should.eql(4);
    });
    onError(parser);
    parser.parseLogFile(FP+'/full_1123dwidgranary.log');
  },
  'ctfdoublecross': function() {
    var parser = new LogParser();
    parser.config.ignoreUnrecognizedLines = false;
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(7);
      log.redScore.should.eql(2);
    });
    onError(parser);
    parser.parseLogFile(FP+'/full_ctfdoublecross.log');
  },
  'plupward': function() {
    //note, this file was changed from original to make sure at the end the teams are on opposite teams from the beginning.
    //this is to ensure that team switching is being found.
    var parser = new LogParser();
    parser.config.ignoreUnrecognizedLines = false;
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(4);
      log.redScore.should.eql(0);
    });
    onError(parser);
    parser.parseLogFile(FP+'/full_plupward.log');
  },
  'kothviaduct': function() {
    var parser = new LogParser();
    parser.config.ignoreUnrecognizedLines = false;
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(4);
      log.redScore.should.eql(0);
      log.playableSeconds.should.eql(1181); //minus humiliation rounds
      log.players[8].kills.should.eql(31); //target's kills, minus kills in humiliation
    });
    onError(parser);
    parser.parseLogFile(FP+'/full_kothviaduct.log');
  },
  'badlands_2halves': function() {
    /**
      The purpose of this test is to check that the logparser handles multiple halves correctly.
      The log should contain a game_over, then a round_start. The log should ignore everything between the two, except player teams.
      This log file also includes a bogus round_win from a reached time limit game_over.
      The log has been edited to give a player some kills that should let us know that kills were not counted between halves.
      The log has also been edited so that the players will also switch sides.

      KOTH and PL maps both depend on round_wins not proceeding right after a capture. This feature has been removed,
      and we will just suck up the extra round_win

      Also testing game minutes calc across halves
    */
    var parser = new LogParser();
    parser.config.ignoreUnrecognizedLines = false;
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(0);
      log.redScore.should.eql(5);
      log.playableSeconds.should.eql(2027);

      //barncow
      //halftime intermission has 3 kills, plus barncow was given two kills on either half, so should only have 2 kills here.
      log.players[10].kills.should.eql(2);
    });
    onError(parser);
    parser.parseLogFile(FP+'/full_badlands_2halves.log');
  },
  'freight': function() {
    //note - this log file also had problems working with parsingUtils.getLogLineDetails. Removing the "$" at the end of the regexp fixed the issue.
    var parser = new LogParser();
    parser.on('done', function(log) {
      log.should.be.ok;
      log.blueScore.should.eql(4);
      log.redScore.should.eql(3);
      log.elapsedSeconds.should.eql(3787);
      log.playableSeconds.should.eql(3565);
      log.mapName.should.eql('cp_freight_final1');

      //the healing and ubercharge stats from the 4th event were being placed in the third.
      var scytheKillEvent = log.events[28];
      scytheKillEvent.player.steamid.should.eql('STEAM_0:0:946908');
      scytheKillEvent.victim.steamid.should.eql('STEAM_0:0:13365050');
      scytheKillEvent.assister.steamid.should.eql('STEAM_0:1:16481274');
      should.not.exist(scytheKillEvent.healing);
      should.not.exist(scytheKillEvent.ubercharge);
      var wigglesKillEvent = log.events[30];
      wigglesKillEvent.player.steamid.should.eql('STEAM_0:0:1939017');
      wigglesKillEvent.victim.steamid.should.eql('STEAM_0:1:8656857');
      wigglesKillEvent.assister.should.not.be.ok;
      wigglesKillEvent.healing.should.eql(916);
      wigglesKillEvent.ubercharge.should.not.be.ok;
    });
    onError(parser);
    parser.parseLogFile(FP+'/freight_vs_mixup.log');
  }
}

