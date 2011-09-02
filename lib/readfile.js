var fs = require('fs')
    , util = require('util')
    , events = require('events');

function ReadFile() {
  if(!(this instanceof ReadFile)) return new ReadFile();
  events.EventEmitter.call(this);
}
util.inherits(ReadFile, events.EventEmitter);

/**
  Utility method to read in the file one line at a time asynchronously.
  The 'line' event is emitted for each line, in order.
  The 'done' event is emitted when the file is completely read.
  The 'error' event is emitted when an error either in a callback or a system error ocurrs.
  @param filePath file path to the file
*/
ReadFile.prototype.readFile = function(filePath) {

  var stream = fs.createReadStream(filePath)
    , self = this;

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
      self.emit('done', null);
      return;
    }

    try {
      self.emit('line', line);
    } catch(err) {
      if(stream.readable) stream.destroy(); //make sure that the stream needs to be destroyed first
      self.emit('error', err);
      return;
    }
    process.nextTick(parse);
  });
};

module.exports = ReadFile;
