var fs = require('fs');

/**
  Utility method to read in the file one line at a time. This function is asynchronus whereas the previous method is synchronus.
  @param filePath file path to the file
  @param callbackForeachLine function to call for each line. The callback is only given a string representing the line of the file.
  @param callbackWhenDone callback to be used when all lines have been read and each callback has returned. Optional.
  @param objToBind obj to bind to bind "this" within the callbacks.
    callbackWhenDone will be passed err if any error was caught.
*/
function readFile(filePath, callbackForeachLine, callbackWhenDone, objToBind) {
  var stream = fs.createReadStream(filePath);

  stream.setEncoding('utf8');

  var buf = '', queue = [];
  stream.on('data', function(data) {
    var lines = (buf + data).split(/\n/g);
    buf = lines.pop();
    queue = queue.concat(lines);
  });

  stream.on('end', function() {
    if(buf != '') queue.push(buf, null); //don't need to push an empty string to the queue
    else queue.push(null);
  });

  process.nextTick(function parse(){
    if(!queue.length) {process.nextTick(parse); return;}
    var line = queue.shift();
    if(line == null) {
      if(callbackWhenDone) callbackWhenDone(null);
      return;
    }
    //using call here to set "this" to the current log parser object, not the process object.
    try {
      callbackForeachLine.call(objToBind, line);
    } catch(err) {
      if(stream.readable) stream.destroy(); //make sure that the stream needs to be destroyed first
      if(callbackWhenDone) callbackWhenDone(err);
      return;
    }
    process.nextTick(parse);
  });
};

module.exports = readFile;

