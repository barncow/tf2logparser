tf2logparser
============

A log parser for the game Team Fortress 2, written in Javascript for use with node.js. It retrieves stats and game events, and then outputs the data to JSON format.

**Note this is still early, and it does not really do much yet. However, you can install and play if you want.**

With Node and NPM installed, you can install using:

    npm install tf2logparser

And in the code, use:

```javascript
var TF2LogParser = require('tf2logparser').TF2LogParser;

var parser = TF2LogParser.create(); //need to create a new instance, since this stores state between lines.

//and just demonstrating readFile (most of the time, you will use parseLogFile or parseLine, instead of this.)
parser.readFile('./blah.log', function(line) {
  console.log(line);
});
```

More information to come here as the project is developed.

Developer Notes
===============
This project **will** be using TDD/BDD principles. If you submit a pull request, and it does not have relevant tests, it will be rejected/need to be corrected. This goes even if the code solves world hunger, or cancer, or is magically able to teleport complex objects to another place.

Be sure your commits messages are descriptive.

As of right now, this project will be using Expresso and Should.

http://visionmedia.github.com/expresso/ and http://tjholowaychuk.com/post/656851606/expresso-tdd-framework-for-nodejs

http://github.com/visionmedia/should.js

In order to run the tests, you will need to have Node and NPM installed.
In the base directory, run the following commands:

    npm install expresso
    npm install should
    npm install -g expresso   #I needed to do this in order to get the "expresso" command in the shell. YMMV

Once that is done, while still in the base directory, run:

    expresso

This will run everything in the test directory (well, the files named *.test.js).
