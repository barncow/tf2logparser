var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = {
  'can get log': function() {
    var parser = LogParser.create(),
      log = parser.getLog();
    log.should.be.ok;
  },
  
  'can get file from disk': function() {
    var parser = LogParser.create();
    parser.readFile(FP+'/blah.log', function(line) {
      line.should.eql('blahblahblahblahblahblahblahblahblahblahblahblahblahblahblahblah');
    });
  },
  
  'is only getting one line at a time from file, and callbackWhenDone is called when done': function() {
    var parser = LogParser.create(),
      i = 0;
    parser.readFile(FP+'/mini.log', function(line) {
      //if the first two lines are OK, we will assume this is working as intended.
      if(i == 0) line.should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/74.122.197.144-27015/srcds_l/orangebox/tf") (version "4317")');
      else if(i == 1) line.should.eql('L 09/29/2010 - 19:05:47: server_cvar: "mp_falldamage" "0"');
      
      ++i;
    }, function() {i.should.eql(76)});
  },
  
  'sets mapName correctly': function() {
    var parser = LogParser.create();
    parser.parseLogFile(FP+'/full_udplog_granary.log', function(err, log){
      log.mapName.should.eql('cp_granary');
    });
  }
}
