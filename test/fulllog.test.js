var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = { 
 '1123dwidgranary': function() {
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
  }
}
