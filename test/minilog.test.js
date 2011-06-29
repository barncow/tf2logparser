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
      log.weapons.should.eql({ 
        'scattergun': { 
          key: 'scattergun',
          name: 'Scattergun',
          role: 'scout' 
        },
        'tf_projectile_rocket': { 
          key: 'tf_projectile_rocket',
          name: 'Rocket Launcher',
          role: 'soldier' 
        },
        'sniperrifle_hs': { 
          key: 'sniperrifle_hs',
          name: 'Sniper Rifle (Headshot)',
          role: 'sniper' 
        },
        'world': { 
          key: 'world', 
          name: 'World', 
          role: false 
        },
        'sniperrifle': { 
          key: 'sniperrifle',
          name: 'Sniper Rifle (Bodyshot)',
          role: 'sniper' 
        },
        'knife_bs': { 
          key: 'knife_bs',
          name: 'Knife (Backstab)',
          role: 'spy' 
        },
        'sadfsgtghgher': { 
          key: 'sadfsgtghgher',
          name: 'sadfsgtghgher',
          role: false 
        }
      });
      
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
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1862, y: 1217, z: -244}}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red', position: {x: -1837, y: 1073, z: -313}}, 
    weapon: {
      key: 'scattergun',
      name: 'Scattergun',
      role: 'scout'
    }, 
    customKill: false
  });
  ++eventIndex;
      
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 57, 0),
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red'},
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 8, 58, 0),
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    weapon: {
      key: 'tf_projectile_rocket',
      name: 'Rocket Launcher',
      role: 'soldier'
    }, 
    customKill: 'suicide'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2605, y: 1596, z: -546}}, 
    weapon: {
      key: 'scattergun',
      name: 'Scattergun',
      role: 'scout'
    }, 
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 2, 0),
    type: 'domination', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 12, 27, 0),
    type: 'builtobject', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    object: 'OBJ_SENTRYGUN'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}}, 
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -3308, y: 1790, z: -220}}, 
    weapon: {
      key: 'sniperrifle_hs',
      name: 'Sniper Rifle (Headshot)',
      role: 'sniper'
    }, 
    customKill: 'headshot'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 14, 43, 0),
    type: 'revenge', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'},
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 18, 3, 0),
    type: 'say_team', 
    player: {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue'},
    text: 'I can also play pyro. I have been doing that a lot on 2fort and doublecross.'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 20, 15, 0),
    type: 'exinguished', 
    player: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'},
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'},
    weapon: {
      key: 'tf_weapon_medigun',
      name: 'Medigun',
      role: 'medic'
    }
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 24, 18, 0),
    type: 'chargedeployed', 
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    type: 'kill',
    player: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red'},
    victim: {name: '[H2K]BubbleAlan ʚϊɞ', userid: 55, steamid: 'STEAM_0:0:556497', team: 'Red'},
    weapon: {
      key: 'world',
      name: 'World',
      role: false
    }, 
    customKill: 'suicide', 
    healing: 160, 
    ubercharge: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 25, 18, 0),
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red', position: {x: -2771, y: 1546, z: -295}},
    victim: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue', position: {x: -3308, y: 1790, z: -220}},
    weapon: {
      key: 'sniperrifle',
      name: 'Sniper Rifle (Bodyshot)',
      role: 'sniper'
    },
    customKill: false,
    healing: 1800,
    ubercharge: true
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 27, 50, 0),
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
    type: 'captureblocked',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -2440, y: 4826, z: -579}},
    cpname: '#Gravelpit_cap_B'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -1154, y: -245, z: 0}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -1081, y: -270, z: 0}}, 
    weapon: {
      key: 'knife_bs',
      name: 'Knife (Backstab)',
      role: 'spy'
    }, 
    customKill: 'backstab'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'builtobject', 
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    object: 'OBJ_ATTACHMENT_SAPPER'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'flagdefended', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'flagcaptured', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: 1514, y: 790, z: 257}}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: 1732, y: 1214, z: 257}}, 
    weapon: {
      key: 'scattergun',
      name: 'Scattergun',
      role: 'scout'
    }, 
    customKill: 'feign_death'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 8, 0),
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    customKill: 'feign_death'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}}, 
    weapon: {
      key: 'sadfsgtghgher',
      name: 'sadfsgtghgher',
      role: false
    }, 
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    timestamp: new Date(2010, 8, 29, 19, 32, 9, 0),
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue', position: {x: -2419, y: 1637, z: -511}}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red', position: {x: -2605, y: 1596, z: -546}}, 
    weapon: {
      key: 'sadfsgtghgher',
      name: 'sadfsgtghgher',
      role: false
    }, 
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
    roles: [{
      key: 'scout',
      name: 'Scout'
    }],
    damage: 0,
    online: true,
    kills: 2,
    deaths: 1,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {x: -1862, y: 1217, z: -244},
    weaponStats: {
       'scattergun': {
        key: 'scattergun',
        name: 'Scattergun',
        role: 'scout',
        kills: 2,
        deaths: 0
      },
      'sniperrifle_hs': {
        key: 'sniperrifle_hs',
        name: 'Sniper Rifle (Headshot)',
        role: 'sniper',
        kills: 0,
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
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
    online: true,
    kills: 0,
    deaths: 2,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [
      {
        patient: {
          name: 'Cres', 
          userid: 49, 
          steamid: 'STEAM_0:0:8581157', 
          team: 'Blue'
        },
        healing: 72
      },
      {
        patient: {
          name: 'Target', 
          userid: 46, 
          steamid: 'STEAM_0:0:6845279', 
          team: 'Blue'
        },
        healing: 27
      }
    ],
    position: {},
    weaponStats: { 
      'scattergun': {
        key: 'scattergun',
        name: 'Scattergun',
        role: 'scout',
        kills: 0,
        deaths: 1 
      },
     'sniperrifle': { 
        key: 'sniperrifle',
        name: 'Sniper Rifle (Bodyshot)',
        role: 'sniper',
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
    roles: [],
    damage: 33,
    online: false,
    kills: 0,
    deaths: 0,
    assists: 1,
    longest_kill_streak: 0,
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
    items: {
      medkit_small: 2,
      medkit_medium: 1
    },
    healSpread: [],
    position: {},
    weaponStats: {}
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'Ctrl+f Muffin!', 
    userid: 50, 
    steamid: 'STEAM_0:1:9852193', 
    team: 'Red',
    friendid: '76561197979970115',
    roles: [
      {
        key: 'soldier',
        name: 'Soldier'
      },
      {
        key: 'sniper',
        name: 'Sniper'
      }
    ],
    damage: 0,
    online: false,
    kills: 2,
    deaths: 2,
    assists: 0,
    longest_kill_streak: 0,
    headshots: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: {
      'tf_projectile_rocket': { 
        key: 'tf_projectile_rocket',
        name: 'Rocket Launcher',
        role: 'soldier',
        kills: 0,
        deaths: 1 
      },
      'scattergun': { 
        key: 'scattergun',
        name: 'Scattergun',
        role: 'scout',
        kills: 0,
        deaths: 1 
      },
      'sniperrifle_hs': { 
        key: 'sniperrifle_hs',
        name: 'Sniper Rifle (Headshot)',
        role: 'sniper',
        kills: 1,
        deaths: 0 
      },
      'sniperrifle': { 
        key: 'sniperrifle',
        name: 'Sniper Rifle (Bodyshot)',
        role: 'sniper',
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
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
    online: true,
    kills: 0,
    deaths: 3,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: {
      'knife_bs': { 
        key: 'knife_bs',
        name: 'Knife (Backstab)',
        role: 'spy',
        kills: 0,
        deaths: 1 
      },
      'sadfsgtghgher': { 
        key: 'sadfsgtghgher',
        name: 'sadfsgtghgher',
        role: false,
        kills: 0,
        deaths: 2
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
    roles: [],
    damage: 0,
    online: true,
    kills: 0,
    deaths: 0,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: {}
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '`yay!',
    userid: 52,
    steamid: 'STEAM_0:0:973270',
    team: 'Blue',
    friendid: '76561197962212268',
    roles: [{
      key: 'spy',
      name: 'Spy'
    }],
    damage: 0,
    online: true,
    kills: 3,
    deaths: 0,
    assists: 0,
    longest_kill_streak: 0,
    headshots: 0,
    backstabs: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: { 
      'knife_bs': { 
        key: 'knife_bs',
        name: 'Knife (Backstab)',
        role: 'spy',
        kills: 1,
        deaths: 0 
      },
      'sadfsgtghgher': { 
        key: 'sadfsgtghgher',
        name: 'sadfsgtghgher',
        role: false,
        kills: 2,
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
    roles: [],
    damage: 0,
    online: true,
    kills: 0,
    deaths: 0,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: {}
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '[H2K]BubbleAlan ʚϊɞ',
    userid: 55,
    steamid: 'STEAM_0:0:556497',
    team: 'Spectator',
    friendid: '76561197961378722',
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
    online: true,
    kills: 0,
    deaths: 1,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: { 
      'world': { 
        key: 'world',
        name: 'World',
        role: false,
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
    roles: [],
    damage: 0,
    online: false,
    kills: 0,
    deaths: 0,
    assists: 0,
    longest_kill_streak: 0,
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
    items: {},
    healSpread: [],
    position: {},
    weaponStats: {}
  });
  ++playerIndex;
  
  log.players.should.have.length(playerIndex);
}
