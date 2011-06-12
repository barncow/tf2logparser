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
        events: [
          {
            type: 'say',
            player: {
              name: 'Console',
              userid: 0,
              steamid: 'Console',
              team: 'Console'
            },
            text: '"CEVO TF2 stopwatch config file loaded. 08/14/10"'
          },
          {
            type: 'say',
            player: {
              name: 'Console',
              userid: 0,
              steamid: 'Console',
              team: 'Console'
            },
            text: 'console say line'
          }
        ]
      });
    });
  }
}
