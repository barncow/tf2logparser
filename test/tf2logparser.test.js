var should = require('should'),
  LogParser = require('../lib/tf2logparser');
  
module.exports = {
  'can get log': function() {
    var parser = LogParser.create();
    var log = parser.getLog();
    log.should.eql({});
  }
}
