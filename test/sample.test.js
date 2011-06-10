/**
This is just a sample bit of code to prove that expresso is working with should.

Nothing pertinent should be tested here!

This will also serve as a template for future tests.
*/
var assert = require('assert')
  , should = require('should');
  
module.exports = {
  '2+2 should equal 4': function() {
    var add = 2;
    add += 2;
    add.should.equal(4);
  },
  
  '2*2 should equal 4': function() {
    var multi = 2;
    multi *= 2;
    multi.should.equal(4);
  }
}
