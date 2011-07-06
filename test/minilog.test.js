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
    parser.config.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/mini.log', function(err, log) {
      should.not.exist(err);
      
      log.should.be.ok;
      
      //broke out these assertions to help narrow down any potential problems.
      log.blueScore.should.eql(0);
      log.redScore.should.eql(1);
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
      
      //doing these in separate functions to try and keep things clean.
      checkEvents(log);
      checkPlayerStats(log);
    });
  }
}

function checkEvents(log) {
  var eventIndex = 0;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 57, 0),
    elapsedSeconds: 1,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1862, y: 1217, z: -244}}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red', position: {x: -1837, y: 1073, z: -313}},
    assister: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue', position: {x: -2181, y: 821, z: -201}},
    weapon: 'scattergun', 
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 58, 0),
    elapsedSeconds: 2,
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    assister: false,
    weapon: 'tf_projectile_rocket', 
    customKill: 'suicide'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    elapsedSeconds: 186,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2605, y: 1596, z: -546}}, 
    assister: false,
    weapon: 'scattergun', 
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    elapsedSeconds: 186,
    type: 'domination', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 27, 0),
    elapsedSeconds: 211,
    type: 'builtobject', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    object: 'OBJ_SENTRYGUN'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    elapsedSeconds: 347,
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}}, 
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -3308, y: 1790, z: -220}}, 
    assister: false,
    weapon: 'sniperrifle_hs', 
    customKill: 'headshot'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    elapsedSeconds: 347,
    type: 'revenge', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 18, 3, 0),
    elapsedSeconds: 547,
    type: 'say_team', 
    player: {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue'},
    text: 'I can also play pyro. I have been doing that a lot on 2fort and doublecross.'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 18, 3, 0),
    elapsedSeconds: 547,
    type: 'say', 
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'},
    text: 'FISTING!'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 20, 15, 0),
    elapsedSeconds: 679,
    type: 'exinguished', 
    player: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'},
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'},
    weapon: 'tf_weapon_medigun'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 24, 18, 0),
    elapsedSeconds: 922,
    type: 'chargedeployed', 
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    elapsedSeconds: 982,
    type: 'kill',
    player: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red'},
    victim: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red'},
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
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}},
    victim: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', position: {x: -3308, y: 1790, z: -220}},
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
      {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: 234, y: 724, z: -183}},
      {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Blue', position: {x: -70, y: 411, z: -191}},
      {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue', position: {x: 136, y: 733, z: -183}}
    ]
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'captureblocked',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -2440, y: 4826, z: -579}},
    cpname: '#Gravelpit_cap_B'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -1154, y: -245, z: 0}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -1081, y: -270, z: 0}}, 
    assister: false,
    weapon: 'knife_bs', 
    customKill: 'backstab'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'builtobject', 
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    object: 'OBJ_ATTACHMENT_SAPPER'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'flagdefended', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'flagcaptured', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    elapsedSeconds: 1392,
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: 1514, y: 790, z: 257}}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: 1732, y: 1214, z: 257}}, 
    assister: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue', position: {x: -2181, y: 821, z: -201}},
    weapon: 'scattergun', 
    customKill: 'feign_death'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    elapsedSeconds: 1393,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}},
    assister: false,    
    weapon: 'sadfsgtghgher', 
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    elapsedSeconds: 1393,
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}}, 
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
    position: {x: -1862, y: 1217, z: -244},
    roleSpread: {
      'scout': {
        key: 'scout',
        name: 'Scout'
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
    healing: 1800,
    medPicksTotal: 0,
    medPicksDroppedUber: 0,
    position: {},
    roleSpread: {
      'medic': {
        key: 'medic',
        name: 'Medic'
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
        name: 'Soldier'
      },
      'sniper': {
        key: 'sniper',
        name: 'Sniper'
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
    position: {},
    roleSpread: {
      'medic': {
        key: 'medic',
        name: 'Medic'
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
    position: {},
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
    position: {},
    roleSpread: {
      'spy': {
        key: 'spy',
        name: 'Spy'
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
    name: 'ǤooB',
    userid: 54,
    steamid: 'STEAM_0:1:23384772',
    team: 'Spectator',
    friendid: '76561198007035273',
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
    position: {},
    roleSpread: {
      'medic': {
        key: 'medic',
        name: 'Medic'
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
    role: false,
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
    roleSpread: {},
    itemSpread: {},
    healSpread: {},
    weaponSpread: {},
    playerSpread: {}
  });
  ++playerIndex;
  
  log.players.should.have.length(playerIndex);
}
