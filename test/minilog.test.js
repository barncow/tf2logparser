/**
  This is going to test the file mini.log. This file has been constructed to cover most events that come through in the log.
  This will do the fine-grained values testing to ensure number of kills are counted correctly, etc.
*/

var should = require('should'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = { 
 'minilog stats are correct': function() {
    var parser = LogParser.create();
    //parser.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/mini.log', function(log) {
      log.should.be.ok;
      
      log.should.eql({
        blueScore: 0,
        redScore: 0,
        elapsedTime: 0,
        gameSeconds: 0,
        mapName: "",
        events: [],
        players: [
          { 
            name: 'Target',
            userid: 46,
            steamid: 'STEAM_0:0:6845279',
            team: 'Red' 
          },
          {
            name: 'FSTNG! Barncow',
            userid: 53,
            steamid: 'STEAM_0:1:16481274',
            team: 'Blue' 
          },
          { 
            name: 'Cres',
            userid: 49,
            steamid: 'STEAM_0:0:8581157',
            team: 'Blue' 
          },
          { 
            name: 'do0t',
            userid: 47,
            steamid: 'STEAM_0:1:4433828',
            team: 'Unassigned' 
          },
          { 
            name: 'Ctrl+f Muffin!',
            userid: 50,
            steamid: 'STEAM_0:1:9852193',
            team: 'Red' 
          },
          { 
            name: 'perl',
            userid: 57,
            steamid: 'STEAM_0:0:11710749',
            team: 'Red' 
          },
          { 
            name: '[!?] cheap',
            userid: 56,
            steamid: 'STEAM_0:0:12272740',
            team: 'Blue' 
          },
          { 
            name: '`yay!',
            userid: 52,
            steamid: 'STEAM_0:0:973270',
            team: 'Blue' 
          },
          { 
            name: 'ǤooB',
            userid: 54,
            steamid: 'STEAM_0:1:23384772',
            team: 'Spectator' 
          },
          { 
            name: '[H2K]BubbleAlan ʚϊɞ',
            userid: 55,
            steamid: 'STEAM_0:0:556497',
            team: 'Spectator' 
          },
          { 
            name: 'Bill',
            userid: 16,
            steamid: 'STEAM_0:0:23957009',
            team: 'Red' 
          }
        ]
      });
    });
  }
}
