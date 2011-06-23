var should = require('should'),
  WeaponList = require('../lib/weaponlist');
  
module.exports = {
  'can get valid weapon': function() {
    WeaponList.findWeapon('scattergun').should.eql({
      key: 'scattergun',
      name: 'Scattergun',
      role: 'scout'
    });
  },
  
  'can get valid backstab weapon': function() {
    WeaponList.findWeapon('knife', 'backstab').should.eql({
      key: 'knife_bs',
      name: 'Knife (Backstab)',
      role: 'spy'
    });
  },
  
  'can get valid headshot weapon': function() {
    WeaponList.findWeapon('sniperrifle', 'headshot').should.eql({
      key: 'sniperrifle_hs',
      name: 'Sniper Rifle (Headshot)',
      role: 'sniper'
    });
  },
  
  'weapon not found returns dummy object': function() {
    var dummyWeapon = 'argasgafsdfsdsdfsdsdf';
    WeaponList.findWeapon(dummyWeapon).should.eql({
      key: dummyWeapon,
      name: dummyWeapon,
      role: false
    });
  }
}
