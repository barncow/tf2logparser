var should = require('should')
  , LogParser = require('tf2logparser')
  , View = require('view')
  , FIXTURE_PATH = FP = './test/fixtures'
  , onError = function(ee) { //function that takes a EventEmitter instance and adds the error handler to it
    ee.on('error', function(err){throw err;});
  };

module.exports = {
  'freight log 3390': function() {
    //note - this log file also had problems working with parsingUtils.getLogLineDetails. Removing the "$" at the end of the regexp fixed the issue.
    var parser = new LogParser();
    parser.on('done', function(log) {
      testPlayerStats(log);
      testMedicSpread(log);
      testHealSpread(log);
      testWeaponSpread(log);
      testPlayerSpread(log);
      testItemSpread(log);
      testChatLog(log);
    });
    onError(parser);
    parser.parseLogFile(FP+'/freight_vs_mixup.log');
  }
  , 'division': function() {
    View.division(3, 0).should.eql(3);
    View.division(3, 2).should.eql(1.5);
    View.division(27+16, 49).should.eql(0.878);
  }
}

var testPlayerStats = function(log) {
  var table = View.playerStats(log.players, log.playableSeconds);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue'});
  data[2].should.eql({ 
      pyro: { key: 'pyro', name: 'Pyro', secondsPlayed: 2983 }
    , spy: { key: 'spy', name: 'Spy', secondsPlayed: 735 }
    , scout: { key: 'scout', name: 'Scout', secondsPlayed: 62 }
    , soldier: { key: 'soldier', name: 'Soldier', secondsPlayed: 7 } 
  });
  data[3].should.equal(27); //using equal here to ensure that numbers, and not strings, are coming back
  data[4].should.equal(16);
  data[5].should.equal(49);
  data[6].should.equal(0.878);
  data[7].should.equal(0.724);
  data[8].should.equal(7947);
  data[9].should.equal(162.184);
  data[10].should.equal(133.750);
  data[11].should.equal(2);
  data[12].should.equal(0);
  data[13].should.equal(4);
  data[14].should.equal(10);
  data[15].should.equal(0);
  data[16].should.equal(4);
  data[17].should.equal(4);
  data[18].should.equal(5);
  data[19].should.equal(0);
  data[20].should.equal(0);
  data[21].should.equal(1);
  data[22].should.equal(8);
  data[23].should.equal(2);
  data[24].should.equal(7);
};

var testMedicSpread = function(log) {
  var table = View.medicSpread(log.players, log.playableSeconds);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  var data = table.tbody[0];
  data[0].should.eql('Red');
  data[1].should.eql({name: 'Barncow - TF2Logs.com', steamid: 'STEAM_0:1:16481274', friendid: '76561197993228277', team: 'Red'});
  data[2].should.equal(0); //using equal here to ensure that numbers, and not strings, are coming back
  data[3].should.equal(57);
  data[4].should.equal(24);
  data[5].should.equal(2.375);
  data[6].should.equal(0.959);
  data[7].should.equal(31);
  data[8].should.equal(1.292);
  data[9].should.equal(0.522);
  data[10].should.equal(5);
  data[11].should.equal(55065);
  data[12].should.equal(2294.375);
  data[13].should.equal(926.76);
  data[14].should.equal(5);
};

var testHealSpread = function(log) {
  var table = View.healSpread(log.players);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  table.thead.should.eql([
      { acronym: 'T', full: 'Team' }
    , { acronym: null, full: 'Patient' }
    , { name: 'aV. Angry Shrew Inc.', steamid: 'STEAM_0:1:8656857', friendid: '76561197977579443', team: 'Blue' }
    , { name: 'mix^ blackymonster ♡', steamid: 'STEAM_0:0:16250003', friendid: '76561197992765734', team: 'Blue' }
    , { name: 'Barncow - TF2Logs.com', steamid: 'STEAM_0:1:16481274', friendid: '76561197993228277', team: 'Red' }
    , { name: 'remix!', steamid: 'STEAM_0:1:10977141', friendid: '76561197982220011', team: 'Red' }
  ]);

  var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({ name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue' });
  data[2].should.eql(1582);
  data[3].should.eql(84);
  data[4].should.eql(0);
  data[5].should.eql(0);
};

var testWeaponSpread = function(log) {
  var table = View.weaponSpread(log.players, log.weapons);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  table.thead[0].full.should.eql('Team');
  table.thead[1].full.should.eql('Name');
  table.thead[2].key.should.eql('minigun');
  table.thead[3].key.should.eql('sniperrifle_hs');
  table.thead[4].key.should.eql('knife_bs');
  table.thead[5].key.should.eql('shotgun_primary'); //engineer's shotgun
  table.thead[6].key.should.eql('tf_projectile_pipe_remote'); //sticky
  table.thead[7].key.should.eql('liberty_launcher');
  table.thead[8].key.should.eql('scattergun');
  table.thead[9].key.should.eql('tf_projectile_pipe'); //pipes
  table.thead[10].key.should.eql('world');
  table.thead[11].key.should.eql('shotgun_pyro');
  table.thead[12].key.should.eql('sniperrifle');
  table.thead[13].key.should.eql('force_a_nature');
  table.thead[14].key.should.eql('tf_projectile_rocket');
  table.thead[15].key.should.eql('obj_minisentry');
  table.thead[16].key.should.eql('iron_curtain');
  table.thead[17].key.should.eql('axtinguisher');
  table.thead[18].key.should.eql('knife');
  table.thead[19].key.should.eql('shotgun_hwg');
  table.thead[20].key.should.eql('proto_syringe');
  table.thead[21].key.should.eql('revolver');
  table.thead[22].key.should.eql('flaregun');
  table.thead[23].key.should.eql('degreaser');
  table.thead[24].key.should.eql('paintrain');
  table.thead[25].key.should.eql('wrangler_kill');
  table.thead[26].key.should.eql('club');
  table.thead[27].key.should.eql('obj_sentrygun3');
  table.thead[28].key.should.eql('maxgun');
  table.thead[29].key.should.eql('obj_sentrygun2');
  table.thead[30].key.should.eql('obj_sentrygun');
  table.thead[31].key.should.eql('shotgun_soldier');
  table.thead[32].key.should.eql('deflect_rocket');

var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({ name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue' });
  data[2].should.eql({ kills: 0, deaths: 7 });
  data[3].should.eql({ kills: 0, deaths: 3 });
  data[4].should.eql({ kills: 4, deaths: 2 });
  data[5].should.eql({ kills: 0, deaths: 3 });
  data[6].should.eql({ kills: 0, deaths: 9 });
  data[7].should.eql({ kills: 0, deaths: 5 });
  data[8].should.eql({ kills: 0, deaths: 0 });
  data[9].should.eql({ kills: 0, deaths: 0 });
  data[10].should.eql({ kills: 0, deaths: 1 });
  data[11].should.eql({ kills: 3, deaths: 1 });
  data[12].should.eql({ kills: 0, deaths: 2 });
  data[13].should.eql({ kills: 0, deaths: 4 });
  data[14].should.eql({ kills: 0, deaths: 0 });
  data[15].should.eql({ kills: 0, deaths: 1 });
  data[16].should.eql({ kills: 0, deaths: 0 });
  data[17].should.eql({ kills: 3, deaths: 0 });
  data[18].should.eql({ kills: 0, deaths: 1 });
  data[19].should.eql({ kills: 0, deaths: 1 });
  data[20].should.eql({ kills: 0, deaths: 0 });
  data[21].should.eql({ kills: 0, deaths: 1 });
  data[22].should.eql({ kills: 0, deaths: 1 });
  data[23].should.eql({ kills: 17, deaths: 3 });
  data[24].should.eql({ kills: 0, deaths: 0 });
  data[25].should.eql({ kills: 0, deaths: 2 });
  data[26].should.eql({ kills: 0, deaths: 1 });
  data[27].should.eql({ kills: 0, deaths: 1 });
  data[28].should.eql({ kills: 0, deaths: 0 });
  data[29].should.eql({ kills: 0, deaths: 0 });
  data[30].should.eql({ kills: 0, deaths: 0 });
  data[31].should.eql({ kills: 0, deaths: 0 });
  data[32].should.eql({ kills: 0, deaths: 0 });
};

var testPlayerSpread = function(log) {
  var table = View.playerSpread(log.players);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;  

  table.thead.should.eql([
      { acronym: 'T', full: 'Team' }
    , { acronym: null, full: 'Name' }
    , { name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue' }
    , { name: 'aV. Angry Shrew Inc.', steamid: 'STEAM_0:1:8656857', friendid: '76561197977579443', team: 'Blue' }
    , { name: 'mix^ Platinum', steamid: 'STEAM_0:0:206754', friendid: '76561197960679236', team: 'Blue' }
    , { name: 'testify♡', steamid: 'STEAM_0:0:20079783', friendid: '76561198000425294', team: 'Red' }
    , { name: 'aV. rr-', steamid: 'STEAM_0:0:13365050', friendid: '76561197986995828', team: 'Blue' }
    , { name: 'aV. Dun', steamid: 'STEAM_0:0:14295714', friendid: '76561197988857156', team: 'Blue' }
    , { name: 'mix^ blackymonster ♡', steamid: 'STEAM_0:0:16250003', friendid: '76561197992765734', team: 'Blue' }
    , { name: 'Tte powah', steamid: 'STEAM_0:1:17186868', friendid: '76561197994639465', team: 'Blue' }
    , { name: 'BLUES FOR THE RED SUN', steamid: 'STEAM_0:0:1300065', friendid: '76561197962865858', team: 'Blue' }
    , { name: 'Wiggles', steamid: 'STEAM_0:0:1939017', friendid: '76561197964143762', team: 'Red' }
    , { name: 'Barncow - TF2Logs.com', steamid: 'STEAM_0:1:16481274', friendid: '76561197993228277', team: 'Red' }
    , { name: 'Scythe-Messiah', steamid: 'STEAM_0:0:946908', friendid: '76561197962159544', team: 'Red' }
    , { name: 'Cres', steamid: 'STEAM_0:0:8581157', friendid: '76561197977428042', team: 'Red' }
    , { name: 'Flak', steamid: 'STEAM_0:1:17557682', friendid: '76561197995381093', team: 'Red' }
    , { name: 'remix!', steamid: 'STEAM_0:1:10977141', friendid: '76561197982220011', team: 'Red' }
    , { name: 'GrieVe', steamid: 'STEAM_0:1:16208935', friendid: '76561197992683599', team: 'Red' }
    , { name: 'Target', steamid: 'STEAM_0:0:6845279', friendid: '76561197973956286', team: 'Red' }
    , { name: 'aV. ben', steamid: 'STEAM_0:1:12152866', friendid: '76561197984571461', team: 'Blue' }
    , { name: 'INFUSED Greg', steamid: 'STEAM_0:0:521077', friendid: '76561197961307882', team: 'Blue' } 
  ]);

  var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({ name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue' });
  data[2].should.eql(0);
  data[3].should.eql(0);
  data[4].should.eql(0);
  data[5].should.eql(1);
  data[6].should.eql(0);
  data[7].should.eql(0);
  data[8].should.eql(0);
  data[9].should.eql(0);
  data[10].should.eql(0);
  data[11].should.eql(3);
  data[12].should.eql(2);
  data[13].should.eql(4);
  data[14].should.eql(4);
  data[15].should.eql(4);
  data[16].should.eql(1);
  data[17].should.eql(4);
  data[18].should.eql(4);
  data[19].should.eql(0);
  data[20].should.eql(0);
};

var testItemSpread = function(log) {
  var table = View.itemSpread(log.players);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;  

  table.thead.should.eql([ 
      { acronym: 'T', full: 'Team' }
    , { acronym: null, full: 'Name' }
    , 'medkit_medium'
    , 'ammopack_medium'
    , 'ammopack_small'
    , 'tf_ammo_pack'
    , 'medkit_small'
  ]);

  var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({ name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701', team: 'Blue' });
  data[2].should.eql(7);
  data[3].should.eql(8);
  data[4].should.eql(12);
  data[5].should.eql(51);
  data[6].should.eql(7);
};

var testChatLog = function(log) {
  var table = View.chatLog(log.events);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;  

  table.thead.should.eql(["Elapsed Time", "Name", "Message"]);

  var data = table.tbody[0];
  data[0].should.eql(113);
  data[1].should.eql({ name: 'aV. Angry Shrew Inc.', steamid: 'STEAM_0:1:8656857', team: 'Blue' });
  data[2].should.eql({ text: '**USING UBER**', type: 'say_team' });

  data = table.tbody[1];  
  data[0].should.eql(134);
  data[1].should.eql({ name: 'GrieVe', steamid: 'STEAM_0:1:16208935', team: 'Red' });
  data[2].should.eql({ text: 'n1 blacky', type: 'say' } );
};