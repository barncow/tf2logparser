var should = require('should'),
  parsingUtils = require('../lib/parsingutils'),
  LogParser = require('../lib/tf2logparser'),
  FIXTURE_PATH = FP = './test/fixtures';
  
module.exports = {
  'getTimestamp sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine).should.eql({
      month: 3,
      day: 27,
      year: 2011,
      hour: 18,
      minute: 0,
      second: 8
    });
  },
  
  'getTimestamp returns false for corrupt value': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getTimestamp(logLine.substring(0, 10)).should.not.be.ok;
  },
  
  'getLogLineDetails sunny case': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine).should.eql('"Console<0><Console><Console>" say "fresh prince of bel air"');
  },
  
  'getLogLineDetails on corrupt string returns false': function() {
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getLogLineDetails(logLine.substring(0, 10)).should.not.be.ok;
  },
  
  'getMap returns values for sunny case': function() {
    var loadingMapLine = 'L 04/03/2011 - 15:20:36: Loading map "ctf_2fort"';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(loadingMapLine)).should.eql('ctf_2fort');
    
    var startingMapLine = 'L 04/03/2011 - 15:20:36: Started map "ctf_impact2" (CRC "1634099807")';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(startingMapLine)).should.eql('ctf_impact2');
    
    var currentMapLine = 'L 04/03/2011 - 15:20:36: Current map "ctf_doublecross" ';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(currentMapLine)).should.eql('ctf_doublecross');
  },
  
  'getMap returns false for corrupt string': function() {    
    var logLine = 'L 03/27/2011 - 18:00:08: "Console<0><Console><Console>" say "fresh prince of bel air"';
    parsingUtils.getMap(parsingUtils.getLogLineDetails(logLine)).should.not.be.ok;
  },
  
  'isLogLineOfType': function() {
    var parser = LogParser.create();
    
    //garbage data
    parser.readFile(FP+'/blah.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;
    });
    
    parser.readFile(FP+'/line_initialline.log', function(line) {
      var details = parsingUtils.getLogLineDetails(line);
      
      //using incorrect line type
      parsingUtils.isLogLineOfType(details, "blah").should.not.be.ok;
      
      //sunny case
      parsingUtils.isLogLineOfType(details, "Log file started").should.be.ok;
    });
    
    
  },
  
  'scrubLogLine': function() {
    var parser = LogParser.create();
    
    parser.readFile(FP+'/line_initialline.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: Log file started (file "logs/L0929002.log") (game "/home/barncow/255.255.255.255-27015/srcds_l/orangebox/tf") (version "4317")');
    });
    
    parser.readFile(FP+'/line_rcon.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:05:47: rcon from "255.255.255.255:50039": command "exec cevo_stopwatch.cfg"');
    });
    
    parser.readFile(FP+'/line_player_connected.log', function(line) {
      parsingUtils.scrubLogLine(line).should.eql('L 09/29/2010 - 19:06:32: "Cres<49><STEAM_0:0:8581157><>" connected, address "255.255.255.255:27005"');
    });
  }
}
