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
    parser.parseLogFile(FP+'/mini.log', function(err, log) {
      if(err) console.log(err);
      
      log.should.be.ok;
      
      log.should.eql({
        blueScore: 0,
        redScore: 0,
        elapsedTime: 0,
        gameSeconds: 0,
        mapName: "ctf_2fort",
        events: [],
        players: [
          { 
            name: 'Target',
            userid: 46,
            steamid: 'STEAM_0:0:6845279',
            team: 'Red',
            roles: [{role: 'scout'}]
          },
          {
            name: 'FSTNG! Barncow',
            userid: 53,
            steamid: 'STEAM_0:1:16481274',
            team: 'Blue',
            roles: []
          },
          { 
            name: 'Cres',
            userid: 49,
            steamid: 'STEAM_0:0:8581157',
            team: 'Blue',
            roles: []
          },
          { 
            name: 'do0t',
            userid: 47,
            steamid: 'STEAM_0:1:4433828',
            team: 'Unassigned',
            roles: []
          },
          { 
            name: 'Ctrl+f Muffin!',
            userid: 50,
            steamid: 'STEAM_0:1:9852193',
            team: 'Red',
            roles: []
          },
          { 
            name: 'perl',
            userid: 57,
            steamid: 'STEAM_0:0:11710749',
            team: 'Red',
            roles: []
          },
          { 
            name: '[!?] cheap',
            userid: 56,
            steamid: 'STEAM_0:0:12272740',
            team: 'Blue',
            roles: []
          },
          { 
            name: '`yay!',
            userid: 52,
            steamid: 'STEAM_0:0:973270',
            team: 'Blue',
            roles: []
          },
          { 
            name: 'ǤooB',
            userid: 54,
            steamid: 'STEAM_0:1:23384772',
            team: 'Spectator',
            roles: []
          },
          { 
            name: '[H2K]BubbleAlan ʚϊɞ',
            userid: 55,
            steamid: 'STEAM_0:0:556497',
            team: 'Spectator',
            roles: []
          },
          { 
            name: 'Bill',
            userid: 16,
            steamid: 'STEAM_0:0:23957009',
            team: 'Red',
            roles: []
          }
        ]
      });
    });
  }
}
