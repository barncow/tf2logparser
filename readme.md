# tf2logparser

A log parser for the game Team Fortress 2, written in Javascript for use with node.js. It retrieves stats and game events, and then outputs the data to JSON format.

With Node and NPM installed, you can install using:

    npm install tf2logparser

And in the code, use:

```javascript
var TF2LogParser = require('tf2logparser').TF2LogParser;
var parser = TF2LogParser.create(); //need to create a new instance, since this stores state between lines.
parser.parseLogFile(FP+'/blah.log', function(err, log) {
  //err, if not falsey, will contain any errors that occurred.
  //log is the final log object, that contains all stats.
  console.log("Blue Score: %d\nRed Score: %d", log.blueScore, log.redScore);
});
```

The following documentation is a work in progress, and will change as time goes on. However, it should be enough to get you going. Also, the code is fairly well documented.

# The `log` Object
The callback from `TF2LogParser.parseLogFile` returns a `log` object, which is an object that holds all data about the game that was played. The overall structure is listed below, along with comments. Some properties of the object have more explanation further below.

```javascript
{
  blueScore: 0, //blue team's score
  redScore: 0, //red team's score
  gameStartTimestamp: null, //the timestamp of when the game started, not necessarily where the log file starts.
  gameEndTimestamp: null, //the timestamp of when the game ends, not necessarily where the log file ends.
  elapsedSeconds: 0, //the number of total seconds, from start to finish
  playableSeconds: 0, //the number of seconds that were played: elapsedSeconds - humiliation rounds - pauses
  mapName: "", //name of the map, if found in the log
  mapType: "cp", //map type. This will only likely be "cp" or "ctf", and will likely be changed in a future release.
  events: [], //events that occurred in the game, such as kills. Expanded further below.
  players: [], //players that were in the game, along with their stats. Expanded further below.
  weapons: [], //a list of all weapons that were in the game. These are their raw names from the log. You will need to use WeaponList.findWeapon() to translate to the actual weapon name and the class (we use the term role to prevent language conflicts), if applicable, that uses it.
  positions: [] //an array of the positions of the players that were in the game, if enabled in the log.
}
```

## The `events` Property
The `events` property of the `log` object is an array of objects that represent kills, point captures, flag events, etc. The format of these objects can differ based on what data they need to carry, however all `event` objects will all have the `type` property, that shows what type of event the object represents. They will also have a `timestamp`, which is the timestamp from the log of when the action occurred, and a `elapsedSeconds` property, which is the number of seconds from when the game started (useful for doing playback).

### The `kill` Type Event

```javascript
{
  timestamp: new Date(2010, 8, 29, 19, 14, 43, 0), //when the event occurred in the log
  elapsedSeconds: 347, //number of seconds that this event occurred from the start of the game
  type: 'kill', //type of event
  //"player" and "victim" are the player that attacked, and the player that died, respectively.
  player: {
    name: 'Ctrl+f Muffin!', //name of the player
    userid: 50, //server userid of the player
    steamid: 'STEAM_0:1:9852193', //steamid of the player
    team: 'Red', //current team of the player
    position: {x: -2771, y: 1546, z: -295}, //the in-game coordinates of the player when the action occurred.
    role: { key: 'sniper', name: 'Sniper' } //the class of the player when performing the action. "key" is how the class is referred to in the log, and "name" is a more human-readable format.
  }, 
  victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -3308, y: 1790, z: -220}, role: { key: 'scout', name: 'Scout' }}, 
  assister: false, //if false, there was no player that had an assist for this kill. Otherwise, there would be a full player object, just like the "player" and "victim" objects above.
  weapon: 'sniperrifle_hs', //the raw weapon name from the log, except that for headshots, "_hs" is appended, and for backstabs, "_bs" is appended. Use WeaponList.findWeapon() to translate to the actual weapon name and the class.
  customKill: 'headshot' //if false, no extra information. Otherwise this will be "headshot", "backstab", or "feign_death" (spy using Dead Ringer).
}
```

(more events to be added)

## The `players` Property
The `players` property of the `log` object is an array of objects that represent the players that were in the game, along with their stats. Below is an example object.

```javascript
{
  name: 'FSTNG! Barncow', //current name of the player
  userid: 53, //the player's current server userid
  steamid: 'STEAM_0:1:16481274', //the player's steam id
  team: 'Blue', //the player's current team
  friendid: '76561197993228277', //the player's friend id (for example, http://steamcommunity.com/profiles/76561197993228277)
  joinedGame: Date(2010, 8, 29, 19, 8, 56, 0), //when the player joined the game, either when the game starts, or afterwards.
  role: {
    key: 'medic', //the player's current class, as the log refers to it
    name: 'Medic' //the player's current class, in a more human-readable form
  },
  damage: 0, //the amount of damage that a player has done to other players
  online: true, //whether or not the player is still in the game
  kills: 0,
  deaths: 2,
  assists: 0,
  longestKillStreak: 0, //highest number of kills without a death
  longestDeathStreak: 2, //highest number of deaths without a kill
  headshots: 0,
  backstabs: 0,
  pointCaptures: 0,
  pointCaptureBlocks: 0,
  flagDefends: 0,
  flagCaptures: 0,
  dominations: 0,
  timesDominated: 0,
  revenges: 0,
  extinguishes: 0, //number of times that a player put out another player on fire
  ubers: 1,
  droppedUbers: 1,
  healing: 2310,
  medPicksTotal: 0, //total number of medics killed
  medPicksDroppedUber: 0, //number of medics killed, where the medic dropped their uber
  position: { x: -3308, y: 1790, z: -220 }, //current position of the player
  roleSpread: { //the classes that the player played, along with the number of seconds that they played it
    'medic': {
      key: 'medic',
      name: 'Medic',
      secondsPlayed: 1666
    }
  },
  itemSpread: { //the items that a player picked up
    medkit_small: 2,
    medkit_medium: 1
  },
  healSpread: { //the amount of healing done to each player
    'STEAM_0:0:8581157': {
      name: 'Cres',
      steamid: 'STEAM_0:0:8581157', 
      healing: 72
    },
    'STEAM_0:0:6845279': {
      name: 'Target',
      steamid: 'STEAM_0:0:6845279', 
      healing: 27
    }
  },
  weaponSpread: {  //weapons that this player killed with and/or died from
    'scattergun': {
      key: 'scattergun',
      kills: 0,
      deaths: 1 
    },
   'sniperrifle': { 
      key: 'sniperrifle',
      kills: 0,
      deaths: 1 
    }
  },
  playerSpread: { //players that this player killed and/or died from
    'STEAM_0:0:6845279': { 
        name: 'Target',
        steamid: 'STEAM_0:0:6845279',
        kills: 0,
        deaths: 1 
    },
    'STEAM_0:1:9852193': { 
      name: 'Ctrl+f Muffin!',
      steamid: 'STEAM_0:1:9852193',
      kills: 0,
      deaths: 1
    } 
  }
}
```

## The `positions` Property
This holds the positions of players, if the server is using `log_verbose_enable 1`. This is outside the normal `events` array so that it can be removed from this object and saved elsewhere if needed to normalize a database.

### Example Object

```javascript
{
  timestamp: new Date(2010, 8, 29, 19, 8, 57, 0), //when the event occurred
  elapsedSeconds: 1, //the number of seconds from the start of the game that this occurred
  player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', role: { key: 'medic', name: 'Medic' }}, //player's information
  position: {x: -1862, y: 1217, z: -244}, //position of the player
}
```

# The `RoleList` Object
This object can be used to convert the log's representation of a class to a more human readable format.

Example usage:

```javascript
var scout = require('tf2logparser').RoleList.findRole('scout');
/*returns:
{
  key: 'scout',
  name: 'Scout'
}
*/
```

# The `WeaponList` Object
This object can be used to convert the log's representation of a weapon to a more human readable format, along with what class wields the weapon (if applicable). This is useful to derive a player's current class, if the lines that denote this are not present in the log. This will be updated with future weapons that will be added from Valve.

Note: This also holds variants of weapons where the weapon was used to headshot or backstab, as opposed to just a bodyshot or damage kill, respectively.

Example usage:

```javascript
var scout = require('tf2logparser').WeaponList.findWeapon('knife_bs');
/*returns:
{
  key: 'knife_bs', //name of weapon from the log
  name: "Knife (Backstab)", //human readable description
  role: 'spy' //class that the weapon can be used by. Use RoleList.findRole() to get the human-readable representation. If false, then the weapon can be used by multiple players, such as the Pain Train (usable by Soldier and Demo)
}
*/
```

# The `ParsingUtils` Object
This object is a series of helper functions to retrieve data from the log file.

# The `TF2LogParser` Object
This object has functions for reading a log file, parsing its contents, and getting data back from it. There are also two configuration options, that can be set as follows:

```javascript
var parser = require('tf2logparser').TF2LogParser.create();
parser.config.ignoreUnrecognizedLines = false; //default: True - this will ignore any lines that the parser does not recognize. If false, will throw an error when an unrecognized line is encountered.
parser.config.ignoreBots = false; //default: True - this will ignore any line that includes a bot. If false, will include bots.
parser.parseLogFile('./blah.log');
```

# Developer Notes
This project **will** be using TDD/BDD principles. If you submit a pull request, and it does not have relevant tests, it will be rejected/need to be corrected. This goes even if the code solves world hunger, or cancer, or is magically able to teleport complex objects to another place.

Be sure your commit messages are descriptive.

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
