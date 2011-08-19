var should = require('should')
  , LogParser = require('tf2logparser')
  , View = require('view')
  , FIXTURE_PATH = FP = './test/fixtures'
  , onError = function(ee) { //function that takes a EventEmitter instance and adds the error handler to it
    ee.on('error', function(err){throw err;});
  };

module.exports = {
  'playerStats': function() {
    //note - this log file also had problems working with parsingUtils.getLogLineDetails. Removing the "$" at the end of the regexp fixed the issue.
    var parser = LogParser.create();
    parser.on('done', function(log) {
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
      data[3].should.eql(27);
      data[4].should.eql(16);
      data[5].should.eql(49);
      data[6].should.eql(0.878);
      data[7].should.eql(0.724);
      data[8].should.eql(7947);
      data[9].should.eql(162.184);
      data[10].should.eql(133.750);
      data[11].should.eql(2);
      data[12].should.eql(0);
      data[13].should.eql(4);
      data[14].should.eql(10);
      data[15].should.eql(0);
      data[16].should.eql(4);
      data[17].should.eql(4);
      data[18].should.eql(5);
      data[19].should.eql(0);
      data[20].should.eql(0);
      data[21].should.eql(1);
      data[22].should.eql(8);
      data[23].should.eql(2);
      data[24].should.eql(7);
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