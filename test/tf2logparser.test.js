var should = require('should'),
  parser = require('../lib/tf2logparser').create();
  
module.exports = {
  'can get log': function() {
    var log = parser.getLog();
    log.should.eql({});
  }
}
