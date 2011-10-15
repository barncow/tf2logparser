/**
  This is going to test the file mini.log. This file has been constructed to cover most events that come through in the log.
  This will do the fine-grained values testing to ensure number of kills are counted correctly, etc.
*/

var should = require('should')
  , LogParser = require('tf2logparser')
  , ReadFile = require('readfile')
  , FIXTURE_PATH = FP = './test/fixtures';

module.exports = {
 'minilog stats are correct': function() {
    var parser = new LogParser({ignoreUnrecognizedLines: false});
    parser.on('done', checkLog);
    parser.on('error', function(err){throw err;});
    parser.parseLogFile(FP+'/mini.log');
  }
  , 'minilog realtime': function() {
    var parser = new LogParser({ignoreUnrecognizedLines: false, isRealTime: true});
    parser.on('done', checkLog);

    var rf = new ReadFile();
    rf.on('error', function(err){throw err;});

    var lineNum = 1; //1 - indexing to make it easier to check the file.
    rf.on('line', function(line) {
      var delta = parser.parseLine(line);

      if(lineNum === 38) {
        //say event
        delta.length.should.be.equal(1);
        delta[0].events[0].type.should.be.eql('say');
      } else if(lineNum === 42 || lineNum == 22) {
        //position report
        delta.length.should.be.equal(1);
        delta[0].positions[0].position.should.be.ok;
      } else if(lineNum === 20 || (
          lineNum != 33 //rcon
          && lineNum != 44 //healed
          && lineNum != 45 //healed
          && lineNum != 46 //medic_death
          && lineNum != 50 //medic_death
          && lineNum != 52 //medic_death
          && lineNum != 54 //changed role todo event
          && lineNum != 61 //kill assist
          && lineNum != 62 //discon todo event
          && lineNum != 63 //discon todo event
          && lineNum != 64 //corrupt line
          && lineNum != 65 //discon todo event
          && lineNum != 66 //corrupt line
          && lineNum != 67 //medic_death
          && lineNum != 68 //sourcemod cmd
          && lineNum != 69 //console say
          && lineNum != 70 //bot entered game
          && lineNum != 74 //and 75 - bot action
          && lineNum >= 28 && lineNum < 75)) {
        //21 is kill assist
        //22-27 are damage and item pickup - todo item pickups should be events, so should entered game
        delta.length.should.be.equal(1);
      } else {
        delta.length.should.be.equal(0);
      }

      ++lineNum;
    });
    rf.readFile(FP+'/mini.log');
  }
}

function checkLog(log) {
  log.should.be.ok;

  //broke out these assertions to help narrow down any potential problems.
  log.blueScore.should.eql(1);
  log.redScore.should.eql(0);
  log.gameStartTimestamp.should.eql(new Date(2010, 8, 29, 19, 8, 56, 0));
  log.gameEndTimestamp.should.eql(new Date(2010, 8, 29, 19, 36, 42, 0));
  log.elapsedSeconds.should.eql(1666);
  log.playableSeconds.should.eql(1656);
  log.mapName.should.eql('ctf_2fort');
  log.weapons.should.eql([
    'scattergun',
    'tf_projectile_rocket',
    'sniperrifle_hs',
    'world',
    'sniperrifle',
    'knife_bs',
    'sadfsgtghgher'
  ]);
  log.positions.should.eql([
    {
      timestamp: new Date(2010, 8, 29, 19, 8, 57, 0),
      elapsedSeconds: 1,
      player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', role: { key: 'scout', name: 'Scout' }},
      position: {x: -1862, y: 1217, z: -244},

    },
    {
      timestamp: new Date(2010, 8, 29, 19, 24, 17, 0),
      elapsedSeconds: 921,
      player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', role: { key: 'medic', name: 'Medic' }},
      position: {x: -1862, y: 1217, z: -244},
    }
  ]);

  //doing these in separate functions to try and keep things clean.
  checkEvents(log);
  checkPlayerStats(log);
}

function checkEvents(log) {
  var eventIndex = 0;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 57, 0),
    elapsedSeconds: 1,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1862, y: 1217, z: -244}, role: { key: 'scout', name: 'Scout' }},
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red', position: {x: -1837, y: 1073, z: -313}, role: { key: 'medic', name: 'Medic' }},
    assister: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue', position: {x: -2181, y: 821, z: -201}, role: false},
    weapon: 'scattergun',
    customKill: false
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 58, 0),
    elapsedSeconds: 2,
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: { x: -3718, y: 1821, z: -540 }, role: { key: 'soldier', name: 'Soldier' }},
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: { x: -3718, y: 1821, z: -540 }, role: { key: 'soldier', name: 'Soldier' }},
    assister: false,
    weapon: 'tf_projectile_rocket',
    customKill: 'suicide'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    elapsedSeconds: 186,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -2419, y: 1637, z: -511}, role: { key: 'scout', name: 'Scout' }},
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2605, y: 1596, z: -546}, role: { key: 'soldier', name: 'Soldier' }},
    assister: false,
    weapon: 'scattergun',
    customKill: false
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    elapsedSeconds: 186,
    type: 'domination',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', role: { key: 'scout', name: 'Scout' }},
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', role: { key: 'soldier', name: 'Soldier' }}
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 27, 0),
    elapsedSeconds: 211,
    type: 'builtobject',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: { x: -4015, y: 1821, z: -511 }, role: { key: 'engineer', name: 'Engineer' }},
    object: 'OBJ_SENTRYGUN',
    position: { x: -4015, y: 1821, z: -511 }
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 31, 0),
    elapsedSeconds: 215,
    type: 'killedobject',
    owner: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', role: { key: 'engineer', name: 'Engineer' }},
    destroyer: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', position: { x: -2715, y: 1945, z: -383}, role: false},
    object: 'OBJ_SENTRYGUN'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 49, 0),
    elapsedSeconds: 233,
    type: 'killedobject',
    owner: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', role: { key: 'engineer', name: 'Engineer' }},
    destroyer: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: { x: -4234, y: 1128, z: -511 }, role: { key: 'engineer', name: 'Engineer' }},
    object: 'OBJ_TELEPORTER'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    elapsedSeconds: 347,
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}, role: { key: 'sniper', name: 'Sniper' }},
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -3308, y: 1790, z: -220}, role: { key: 'scout', name: 'Scout' }},
    assister: false,
    weapon: 'sniperrifle_hs',
    customKill: 'headshot'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    elapsedSeconds: 347,
    type: 'revenge',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', role: { key: 'sniper', name: 'Sniper' }},
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', role: { key: 'scout', name: 'Scout' }}
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 18, 3, 0),
    elapsedSeconds: 547,
    type: 'say_team',
    player: {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue', role: false},
    text: 'I can also play pyro. I have been doing that a lot on 2fort and doublecross.'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 18, 3, 0),
    elapsedSeconds: 547,
    type: 'say',
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', role: { key: 'medic', name: 'Medic' }},
    text: 'FISTING!'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 20, 15, 0),
    elapsedSeconds: 679,
    type: 'exinguished',
    player: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: { x: -4192, y: 1397, z: -511 }, role: { key: 'medic', name: 'Medic' }},
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: { x: -4109, y: 1635, z: -511 }, role: { key: 'spy', name: 'Spy' }},
    weapon: 'tf_weapon_medigun'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 20, 24, 0),
    elapsedSeconds: 688,
    type: 'joinedteam',
    player: {name: 'ǤooB', userid: 54, steamid: 'STEAM_0:1:23384772', team: 'Unassigned', team: 'Spectator', role: false},
    team: 'Spectator'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({ 
    timestamp: new Date(2010, 8, 29, 19, 23, 30, 0),
    elapsedSeconds: 874,
    type: 'changedname',
    player: 
     { name: 'ǤooB\'s name is brandon too!!',
       userid: 54,
       steamid: 'STEAM_0:1:23384772',
       team: 'Spectator',
       role: false },
    oldName: 'ǤooB',
    newName: 'ǤooB\'s name is brandon too!!' 
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 24, 18, 0),
    elapsedSeconds: 922,
    type: 'chargedeployed',
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', role: { key: 'medic', name: 'Medic' }}
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    elapsedSeconds: 982,
    type: 'kill',
    player: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red', position: { x: -5072, y: 1286, z: -511 }, role: { key: 'medic', name: 'Medic' }},
    victim: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red', position: { x: -5072, y: 1286, z: -511 }, role: { key: 'medic', name: 'Medic' }},
    assister: false,
    weapon: 'world',
    customKill: 'suicide',
    healing: 160,
    ubercharge: false
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    elapsedSeconds: 982,
    type: 'joinedteam',
    player: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Spectator', role: { key: 'medic', name: 'Medic' }},
    team: 'Spectator'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    elapsedSeconds: 982,
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}, role: { key: 'sniper', name: 'Sniper' }},
    victim: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', position: {x: -3308, y: 1790, z: -220}, role: { key: 'medic', name: 'Medic' }},
    assister: false,
    weapon: 'sniperrifle',
    customKill: false,
    healing: 1800,
    ubercharge: true
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 27, 50, 0),
    elapsedSeconds: 1134,
    type: 'pointcaptured',
    team: 'Blue',
    cpname: '#Gravelpit_cap_A',
    players: [
      {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: 234, y: 724, z: -183}, role: { key: 'scout', name: 'Scout' }},
      {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Blue', position: {x: -70, y: 411, z: -191}, role: { key: 'sniper', name: 'Sniper' }},
      {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue', position: {x: 136, y: 733, z: -183}, role: false}
    ]
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({ 
    timestamp: new Date(2010, 8, 29, 19, 27, 50, 0),
    elapsedSeconds: 1134,
    type: 'joinedteam',
    player: 
     { name: 'Bill',
       userid: 16,
       steamid: 'STEAM_0:0:23957009',
       team: 'Red',
       role: { key: 'heavyweapons', name: 'Heavy' } },
    team: 'Red' 
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'captureblocked',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -2440, y: 4826, z: -579}, role: { key: 'spy', name: 'Spy' }},
    cpname: '#Gravelpit_cap_B'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -1154, y: -245, z: 0}, role: { key: 'spy', name: 'Spy' }},
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -1081, y: -270, z: 0}, role: { key: 'medic', name: 'Medic' }},
    assister: false,
    weapon: 'knife_bs',
    customKill: 'backstab'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'builtobject',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: { x: 1457, y: 2273, z: 256 }, role: { key: 'spy', name: 'Spy' }},
    object: 'OBJ_ATTACHMENT_SAPPER',
    position: { x: 1457, y: 2273, z: 256 }
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'flagdefended',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}, role: { key: 'scout', name: 'Scout' }}
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'flagcaptured',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}, role: { key: 'scout', name: 'Scout' }}
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: 1514, y: 790, z: 257}, role: { key: 'scout', name: 'Scout' }},
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: 1732, y: 1214, z: 257}, role: { key: 'spy', name: 'Spy' }},
    assister: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue', position: {x: -2181, y: 821, z: -201}, role: false},
    weapon: 'scattergun',
    customKill: 'feign_death'
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({ 
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    elapsedSeconds: 1393,
    type: 'joinedteam',
    player: 
     { 
       name: 'Target',
       userid: 46,
       steamid: 'STEAM_0:0:6845279',
       team: 'Red',
       role: { key: 'scout', name: 'Scout' } 
     },
    team: 'Red' 
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    elapsedSeconds: 1393,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}, role: { key: 'spy', name: 'Spy' }},
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}, role: { key: 'medic', name: 'Medic' }},
    assister: false,
    weapon: 'sadfsgtghgher',
    customKill: false
  });
  ++eventIndex;

  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    elapsedSeconds: 1393,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}, role: { key: 'spy', name: 'Spy' }},
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}, role: { key: 'medic', name: 'Medic' }},
    assister: false,
    weapon: 'sadfsgtghgher',
    customKill: false
  });
  ++eventIndex;

  eventIndex.should.equal(log.events.length);
}

function checkPlayerStats(log) {
  var playerIndex = 0;

  log.players[playerIndex].should.eql({
    name: 'Target',
    userid: 46,
    steamid: 'STEAM_0:0:6845279',
    team: 'Red',
    friendid: '76561197973956286',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'scout',
      name: 'Scout'
    },
    damage: 0,
    online: true,
    kills: 2,
    deaths: 1,
    assists: 0,
    longestKillStreak: 2,
    longestDeathStreak: 1,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 1,
    pointCaptureBlocks: 0,
    flagDefends: 1,
    flagCaptures: 1,
    dominations: 1,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: {x: 1514, y: 790, z: 257},
    roleSpread: {
      'scout': {
        key: 'scout',
        name: 'Scout',
        secondsPlayed: 1666
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {
       'scattergun': {
        key: 'scattergun',
        kills: 2,
        deaths: 0
      },
      'sniperrifle_hs': {
        key: 'sniperrifle_hs',
        kills: 0,
        deaths: 1
      }
    },
    playerSpread: {
      'STEAM_0:1:16481274': {
        name: 'FSTNG! Barncow',
        steamid: 'STEAM_0:1:16481274',
        kills: 1,
        deaths: 0
      },
      'STEAM_0:1:9852193': {
        name: 'Ctrl+f Muffin!',
        steamid: 'STEAM_0:1:9852193',
        kills: 1,
        deaths: 1
      }
    }
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'FSTNG! Barncow',
    userid: 53,
    steamid: 'STEAM_0:1:16481274',
    team: 'Blue',
    friendid: '76561197993228277',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'medic',
      name: 'Medic'
    },
    damage: 0,
    online: true,
    kills: 0,
    deaths: 2,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 2,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 1,
    droppedUbers: 1,
    healing: 2310,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: { x: -3308, y: 1790, z: -220 },
    roleSpread: {
      'medic': {
        key: 'medic',
        name: 'Medic',
        secondsPlayed: 1666
      }
    },
    itemSpread: {},
    healSpread: {
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
    weaponSpread: {
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
    playerSpread: {
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
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'Cres',
    userid: 49,
    steamid: 'STEAM_0:0:8581157',
    team: 'Blue',
    friendid: '76561197977428042',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: false,
    damage: 33,
    online: false,
    kills: 0,
    deaths: 0,
    assists: 1,
    longestKillStreak: 0,
    longestDeathStreak: 0,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: {},
    roleSpread: {},
    itemSpread: {
      medkit_small: 2,
      medkit_medium: 1
    },
    healSpread: {},
    weaponSpread: {},
    playerSpread: {}
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'Ctrl+f Muffin!',
    userid: 50,
    steamid: 'STEAM_0:1:9852193',
    team: 'Red',
    friendid: '76561197979970115',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'sniper',
      name: 'Sniper'
    },
    damage: 0,
    online: false,
    kills: 2,
    deaths: 2,
    assists: 0,
    longestKillStreak: 2,
    longestDeathStreak: 2,
    headshots: 1,
    backstabs: 0,
    pointCaptures: 1,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 1,
    revenges: 1,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 1,
    medPicksDroppedUber: 1,
    position: {},
    roleSpread: {
      'soldier': {
        key: 'soldier',
        name: 'Soldier',
        secondsPlayed: 211
      },
      'engineer': {
        key: 'engineer',
        name: 'Engineer',
        secondsPlayed: 136
      },
      'sniper': {
        key: 'sniper',
        name: 'Sniper',
        secondsPlayed: 1045
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {
      'tf_projectile_rocket': {
        key: 'tf_projectile_rocket',
        kills: 0,
        deaths: 1
      },
      'scattergun': {
        key: 'scattergun',
        kills: 0,
        deaths: 1
      },
      'sniperrifle_hs': {
        key: 'sniperrifle_hs',
        kills: 1,
        deaths: 0
      },
      'sniperrifle': {
        key: 'sniperrifle',
        kills: 1,
        deaths: 0
      }
    },
    playerSpread: {
      'STEAM_0:1:9852193': {
        name: 'Ctrl+f Muffin!',
        steamid: 'STEAM_0:1:9852193',
        kills: 0,
        deaths: 1
      },
      'STEAM_0:0:6845279': {
        name: 'Target',
        steamid: 'STEAM_0:0:6845279',
        kills: 1,
        deaths: 1
      },
      'STEAM_0:1:16481274': {
        name: 'FSTNG! Barncow',
        steamid: 'STEAM_0:1:16481274',
        kills: 1,
        deaths: 0
      }
    }
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'perl',
    userid: 57,
    steamid: 'STEAM_0:0:11710749',
    team: 'Red',
    friendid: '76561197983687226',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'medic',
      name: 'Medic'
    },
    damage: 0,
    online: true,
    kills: 0,
    deaths: 3,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 3,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 1,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: { x: -2605, y: 1596, z: -546 },
    roleSpread: {
      'engineer': {
        key: 'engineer',
        name: 'Engineer',
        secondsPlayed: 679
      },
      'medic': {
        key: 'medic',
        name: 'Medic',
        secondsPlayed: 987
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {
      'knife_bs': {
        key: 'knife_bs',
        kills: 0,
        deaths: 1
      },
      'sadfsgtghgher': {
        key: 'sadfsgtghgher',
        kills: 0,
        deaths: 2
      }
    },
    playerSpread: {
      'STEAM_0:0:973270': {
        name: '`yay!',
        steamid: 'STEAM_0:0:973270',
        kills: 0,
        deaths: 3
      }
    }
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: '[!?] cheap',
    userid: 56,
    steamid: 'STEAM_0:0:12272740',
    team: 'Blue',
    friendid: '76561197984811208',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: false,
    damage: 0,
    online: true,
    kills: 0,
    deaths: 0,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 0,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 1,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: { x: 136, y: 733, z: -183 },
    roleSpread: {},
    itemSpread: {},
    healSpread: {},
    weaponSpread: {},
    playerSpread: {}
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: '`yay!',
    userid: 52,
    steamid: 'STEAM_0:0:973270',
    team: 'Blue',
    friendid: '76561197962212268',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'spy',
      name: 'Spy'
    },
    damage: 0,
    online: true,
    kills: 3,
    deaths: 0,
    assists: 0,
    longestKillStreak: 3, //his death is a fake from DR
    longestDeathStreak: 0,
    headshots: 0,
    backstabs: 1,
    pointCaptures: 0,
    pointCaptureBlocks: 1,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: { x: -2419, y: 1637, z: -511 },
    roleSpread: {
      'spy': {
        key: 'spy',
        name: 'Spy',
        secondsPlayed: 1666
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {
      'knife_bs': {
        key: 'knife_bs',
        kills: 1,
        deaths: 0
      },
      'sadfsgtghgher': {
        key: 'sadfsgtghgher',
        kills: 2,
        deaths: 0
      }
    },
    playerSpread: {
      'STEAM_0:0:11710749': {
        name: 'perl',
        steamid: 'STEAM_0:0:11710749',
        kills: 3,
        deaths: 0
      }
    }
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'ǤooB\'s name is brandon too!!',
    userid: 54,
    steamid: 'STEAM_0:1:23384772',
    team: 'Spectator',
    friendid: '76561198007035273',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: false,
    damage: 0,
    online: true,
    kills: 0,
    deaths: 0,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 0,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: {},
    roleSpread: {},
    itemSpread: {},
    healSpread: {},
    weaponSpread: {},
    playerSpread: {}
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: '[H2K]BubbleAlan ʚϊɞ',
    userid: 55,
    steamid: 'STEAM_0:0:556497',
    team: 'Spectator',
    friendid: '76561197961378722',
    joinedGame: new Date(2010, 8, 29, 19, 8, 56, 0),
    role: {
      key: 'medic',
      name: 'Medic'
    },
    damage: 0,
    online: true,
    kills: 0,
    deaths: 1,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 1,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 160,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: { x: -5072, y: 1286, z: -511 },
    roleSpread: {
      'medic': {
        key: 'medic',
        name: 'Medic',
        secondsPlayed: 982
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {
      'world': {
        key: 'world',
        kills: 0,
        deaths: 1
      }
    },
    playerSpread: {
      'STEAM_0:0:556497': {
        name: '[H2K]BubbleAlan ʚϊɞ',
        steamid: 'STEAM_0:0:556497',
        kills: 0,
        deaths: 1
      }
    }
  });
  ++playerIndex;

  log.players[playerIndex].should.eql({
    name: 'Bill',
    userid: 16,
    steamid: 'STEAM_0:0:23957009',
    team: 'Red',
    friendid: '76561198008179746',
    joinedGame: new Date(2010, 8, 29, 19, 27, 50, 0),
    role: {
      key: 'heavyweapons',
      name: 'Heavy'
    },
    damage: 0,
    online: false,
    kills: 0,
    deaths: 0,
    assists: 0,
    longestKillStreak: 0,
    longestDeathStreak: 0,
    headshots: 0,
    backstabs: 0,
    pointCaptures: 0,
    pointCaptureBlocks: 0,
    flagDefends: 0,
    flagCaptures: 0,
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: {},
    roleSpread: {
      'heavyweapons': {
        key: 'heavyweapons',
        name: 'Heavy',
        secondsPlayed: 258
      }
    },
    itemSpread: {},
    healSpread: {},
    weaponSpread: {},
    playerSpread: {}
  });
  ++playerIndex;

  log.players.should.have.length(playerIndex);
}

