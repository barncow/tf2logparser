var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = { 
 '1123dwidgranary': function() {
    //note - this log seems to start in the middle of a round. the first capture by red currently does not count until the "round_start"
    var parser = LogParser.create();
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/full_1123dwidgranary.log', function(err, log) {
      if(err) console.log(err.stack);
      should.not.exist(err);   
      log.should.be.ok;
      log.blueScore.should.eql(1);
      log.redScore.should.eql(4);
    });
  },
  'ctfdoublecross': function() {
    var parser = LogParser.create();
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/full_ctfdoublecross.log', function(err, log) {
      if(err) console.log(err.stack);
      should.not.exist(err);   
      log.should.be.ok;
      log.blueScore.should.eql(7);
      log.redScore.should.eql(2);
    });
  },
  'plupward': function() {
    //note, this file was changed from original to make sure at the end the teams are on opposite teams from the beginning.
    //this is to ensure that team switching is being found.
    var parser = LogParser.create();
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/full_plupward.log', function(err, log) {
      if(err) console.log(err.stack);
      should.not.exist(err);   
      log.should.be.ok;
      log.blueScore.should.eql(4);
      log.redScore.should.eql(0);
    });
  },
  'kothviaduct': function() {
    var parser = LogParser.create();
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/full_kothviaduct.log', function(err, log) {
      if(err) console.log(err.stack);
      should.not.exist(err);   
      log.should.be.ok;
      log.blueScore.should.eql(4);
      log.redScore.should.eql(0);
      log.playableSeconds.should.eql(1181); //minus humiliation rounds
      log.players[8].kills.should.eql(31); //target's kills, minus kills in humiliation
    });
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
    var parser = LogParser.create();
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/full_badlands_2halves.log', function(err, log) {
      if(err) console.log(err.stack);
      should.not.exist(err);   
      log.should.be.ok;
      log.blueScore.should.eql(0);
      log.redScore.should.eql(5);
      log.playableSeconds.should.eql(2027);
      
      //barncow
      //halftime intermission has 3 kills, plus barncow was given two kills on either half, so should only have 2 kills here.
      log.players[10].kills.should.eql(2);
    });
  }
}
