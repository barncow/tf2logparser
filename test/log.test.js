/**
  Test for Log manipulation object.
*/

var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  log = require('../lib/log'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = { 
 'addSayEvent': function() {
    var parser = LogParser.create();
    parser.parseLogFile(FP+'/line_console_say.log', function(err, log) {
      log.events.should.be.empty;
    });
  },
  
  'addUpdatePlayer': function() {
    var parser = LogParser.create();
    
    parser.parseLogFile(FP+'/line_world_triggered_roundstart.log');
    parser.parseLogFile(FP+'/line_player_enteredgame.log', function(err, log) {
      log.players[0].name.should.eql('Target');
      log.players[0].userid.should.equal(46);
      log.players[0].steamid.should.eql('STEAM_0:0:6845279');
      log.players[0].online.should.be.ok;
      should.not.exist(log.players[0].team);
      
      //parsing the file again, which should do an update for same player.
      //should still only have the one player.
      parser.parseLogFile(FP+'/line_player_jointeam.log', function(err, log) {
        log.players[0].name.should.eql('Target');
        log.players[0].userid.should.equal(46);
        log.players[0].steamid.should.eql('STEAM_0:0:6845279');
        log.players[0].online.should.be.ok;
        log.players[0].team.should.equal('Blue');
      });    
    });
  },
  
  'addUpdatePlayer online is false': function() {
    var parser = LogParser.create();
    
    parser.parseLogFile(FP+'/line_world_triggered_roundstart.log');
    parser.parseLogFile(FP+'/line_player_disconnected.log', function(err, log) {
      log.players[0].name.should.eql('do0t');
      log.players[0].userid.should.equal(47);
      log.players[0].steamid.should.eql('STEAM_0:1:4433828');
      log.players[0].online.should.not.be.ok;
      log.players[0].team.should.equal('Unassigned');
    });
  },
  
  'incrementStatForPlayer': function() {
    var mylog = log.create();
    var player = {
      name: 'Target',
      userid: 46,
      steamid: 'STEAM_0:0:6845279',
      team: 'Blue',
      online: true
    };
    
    mylog.addUpdatePlayer(player);
    
    var noError = true, error;
    
    //sunny case, should not return error
    try{
      mylog.incrementStatToPlayer(player.steamid, 'damage', false, 10);
    }catch(err) {
      console.log(err); //shouldn't be a message here, if there is, output it.
      noError = false;
    }
    mylog.getLog().players[0].damage.should.eql(10);
    noError.should.be.ok;
    noError = true;
    
    //invalid stat name, should return error
    try{
      mylog.incrementStatToPlayer(player.steamid, 'asdfasfda', false, 10);
    }catch(err) {
      noError = false;
    }
    noError.should.not.be.ok;
    noError = true;
    
    //invalid steamid, should return error
    try{
      mylog.incrementStatToPlayer('adfasfd', 'damage', false, 10);
    }catch(err) {
      noError = false;
    }
    noError.should.not.be.ok;
    noError = true;
    
  },
}
