var should = require('should'),
  RoleList = require('rolelist');

module.exports = {
  'can get valid role': function() {
    RoleList.findRole('scout').should.eql({
      key: 'scout',
      name: 'Scout'
    });
  },

  'role not found returns false': function() {
    RoleList.findRole('fgdfgdfg').should.not.be.ok;
  }
}

