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
    
    parser.parseLogFile(FP+'/line_player_enteredgame.log', function(err, log) {
      log.players.should.eql([{
        name: 'Target',
        userid: 46,
        steamid: 'STEAM_0:0:6845279',
        team: null,
        roles: [],
        damage: 0
      }]);
      
      //parsing the file again, which should do an update for same player.
      //should still only have the one player.
      parser.parseLogFile(FP+'/line_player_jointeam.log', function(err, log) {
        log.players.should.eql([{
          name: 'Target',
          userid: 46,
          steamid: 'STEAM_0:0:6845279',
          team: 'Blue',
          roles: [],
          damage: 0
        }]);      
      });    
    });
  },
  
  'incrementStatForPlayer': function() {
    var mylog = log.create();
    var player = {
      name: 'Target',
      userid: 46,
      steamid: 'STEAM_0:0:6845279',
      team: 'Blue'
    };
    
    mylog.addUpdatePlayer(player);
    
    var noError = true, error;
    
    //sunny case, should not return error
    try{
      mylog.incrementStatToPlayer(player.steamid, 'damage', 10);
    }catch(err) {
      console.log(err); //shouldn't be a message here, if there is, output it.
      noError = false;
    }
    mylog.getLog().players[0].damage.should.eql(10);
    noError.should.be.ok;
    noError = true;
    
    //invalid stat name, should return error
    try{
      mylog.incrementStatToPlayer(player.steamid, 'asdfasfda', 10);
    }catch(err) {
      noError = false;
    }
    noError.should.not.be.ok;
    noError = true;
    
    //invalid steamid, should return error
    try{
      mylog.incrementStatToPlayer('adfasfd', 'damage', 10);
    }catch(err) {
      noError = false;
    }
    noError.should.not.be.ok;
    noError = true;
    
  },
}
