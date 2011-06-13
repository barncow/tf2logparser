/**
  Test for Log manipulation object.
*/

var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  log = require('../lib/log'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = { 
 'Events#addSayEvent': function() {
    var parser = LogParser.create();
    parser.parseLogFile(FP+'/line_console_say.log', function(log) {
      log.events.should.be.empty;
    });
  },
  
  'Players#addUpdatePlayer': function() {
    var parser = LogParser.create();
    
    //TODO: Change this to an actual player with some parameter changing (team?)
    parser.parseLogFile(FP+'/line_player_enteredgame.log', function(log) {
      log.players.should.eql([{
        name: 'Target',
        userid: 46,
        steamid: 'STEAM_0:0:6845279',
        team: null
      }]);
      
      //parsing the file again, which should do an update for same player.
      //should still only have the one player.
      parser.parseLogFile(FP+'/line_player_changerole.log', function(log) {
        log.players.should.eql([{
          name: 'Target',
          userid: 46,
          steamid: 'STEAM_0:0:6845279',
          team: 'Blue'
        }]);      
      });    
    });
  }
}
