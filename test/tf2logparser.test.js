var should = require('should')
  , LogParser = require('tf2logparser')
  , readFile = require('readfile')
  , FIXTURE_PATH = FP = './test/fixtures';

module.exports = {
  'can get log': function() {
    var parser = LogParser.create(),
      log = parser.getLog();
    log.should.be.ok;
  },

  'can get file from disk': function() {
    var parser = LogParser.create();
    readFile(FP+'/blah.log', function(line) {
      line.should.eql('blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah');
    });
  },

  'is only getting one line at a time from file, and callbackWhenDone is called when done': function() {
    var parser = LogParser.create(),
      i = 0;
    readFile(FP+'/mini.log', function(line) {
      //if the first two lines are OK, we will assume this is working as intended.
      if(i == 0) line.should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/74.122.197.144-27015/srcds_l/orangebox/tf") (version "4317")');
      else if(i == 1) line.should.eql('L 09/29/2010 - 19:05:47: server_cvar: "mp_falldamage" "0"');

      ++i;
    }, function() {i.should.eql(82)});
  },

  'sets mapName correctly': function() {
    var parser = LogParser.create();
    parser.parseLogFile(FP+'/full_udplog_granary.log', function(err, log){
      log.mapName.should.eql('cp_granary');
    });
  },

  'gets playableSeconds correctly': function() {
    var parser = LogParser.create();
    parser._getPlayableSeconds([
      {start: new Date(2010, 8, 29, 19, 8, 56, 0)},
      {start: new Date(2010, 8, 29, 19, 8, 57, 0)},
      {end: new Date(2010, 8, 29, 19, 8, 58, 0)},
      {end: new Date(2010, 8, 29, 19, 8, 59, 0)}
    ]).should.equal(2);
  },

  'players are marked with isInMatch during log parsing': function() {
    var parser = LogParser.create(), index = 0;
    readFile(FP+'/mini.log', function(line) {
      parser.parseLine(line);
	  var log = parser.getLog();

	  if(index == 15) {
		//testing that before the match starts, that players are entered
		//and that they are marked with isInMatch == false.
		log.players[0].name.should.eql('Target');
		log.players[0].isInMatch.should.not.be.ok;
		log.players[3].name.should.eql('do0t');
		log.players[3].isInMatch.should.not.be.ok;
	  } else if(index == 21) {
		//testing that when the round has started, that the correct players
		//have been marked with isInMatch == true;
		log.players[0].name.should.eql('Target');
		log.players[0].isInMatch.should.be.ok;
	  }

	  ++index;
    }, function(err) {if(err) throw err;});
  }
}

