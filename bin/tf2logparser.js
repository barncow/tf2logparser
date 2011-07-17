#!/usr/bin/env node

/**
  This script will take in a file and then will output the resulting JSON.
  You can pipe it to a file by doing: tf2logparser mylog.log > mylog.json
*/

(function() {
  var path = require('path'), TF2LogParser = require('../lib/tf2logparser');
  var helpText = "Must specify one file to parse.\nUse: tf2logparser mylog.log\nTo save the output: tf2logparser mylog.log > mylog.json\nBy default, the output is compressed. To make the output have whitespace, use the following after the filename to parse: --pretty or: -p";

  if(process.argv.length < 3 || process.argv[2] == '-h' || process.argv[2] == '--help') {
    console.log(helpText);
    process.exit(1);
  }

  var filename = process.argv[2], spaces = 0;
  var option = process.argv[3] || null;

  if(option == '-p' || option == '--pretty') {
    spaces = 2;
  }

  path.exists(filename, function(exists){
    if(!exists) {
      console.log('The file: "'+filename+'" could not be found.');
      process.exit(1);
    }

    var parser = TF2LogParser.create();
    parser.parseLogFile(filename, function(err, log) {
      if(err) throw err;
      console.log(JSON.stringify(log, null, spaces));
    });
  });
})();

