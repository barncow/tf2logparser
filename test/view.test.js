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
    var parser = LogParser.create();
    parser.on('done', function(log) {
      testPlayerStats(log);
      testMedicStats(log);
      testHealSpread(log);
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
  data[1].should.eql({name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701'});
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

var testMedicStats = function(log) {
  var table = View.medicStats(log.players, log.playableSeconds);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  var data = table.tbody[0];
  data[0].should.eql('Red');
  data[1].should.eql({name: 'Barncow - TF2Logs.com', steamid: 'STEAM_0:1:16481274', friendid: '76561197993228277'});
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
  var table = View.healSpread(log.players, log.playableSeconds);

  table.should.be.ok;
  table.thead.should.be.ok;
  table.tbody.should.be.ok;

  table.thead.should.eql([
      { acronym: 'T', full: 'Team' }
    , { acronym: null, full: 'Patient' }
    , { name: 'aV. Angry Shrew Inc.', steamid: 'STEAM_0:1:8656857', friendid: '76561197977579443' }
    , { name: 'mix^ blackymonster ♡', steamid: 'STEAM_0:0:16250003', friendid: '76561197992765734' }
    , { name: 'Barncow - TF2Logs.com', steamid: 'STEAM_0:1:16481274', friendid: '76561197993228277' }
    , { name: 'remix!', steamid: 'STEAM_0:1:10977141', friendid: '76561197982220011' }
  ]);

  var data = table.tbody[0];
  data[0].should.eql('Blue');
  data[1].should.eql({ name: 'aV. `shishy!', steamid: 'STEAM_0:1:15466986', friendid: '76561197991199701' });
  data[2].should.eql(1582);
  data[3].should.eql(84);
  data[4].should.eql(0);
  data[5].should.eql(0);
};