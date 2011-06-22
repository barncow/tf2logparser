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
    parser.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/mini.log', function(err, log) {
      should.not.exist(err);
      
      log.should.be.ok;
      
      //broke out these assertions to help narrow down any potential problems.
      
      log.blueScore.should.eql(0);
      log.redScore.should.eql(1);
      log.gameStartTimestamp.should.eql(new Date(2010, 8, 29, 19, 8, 56, 0));
      log.gameEndTimestamp.should.eql(new Date(2010, 8, 29, 19, 36, 42, 0));
      log.elapsedSeconds.should.eql(1666);
      log.gameSeconds.should.eql(0);
      log.mapName.should.eql('ctf_2fort');
      
      //doing these in separate functions to try and keep things clean.
      checkEvents(log);
      checkPlayerStats(log);
    });
  }
}

function checkEvents(log) {
  var eventIndex = 0;
  
  log.events[eventIndex].should.eql({
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
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red'},
    customKill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'domination', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'builtobject', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    object: 'OBJ_SENTRYGUN'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'revenge', 
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'say_team', 
    player: {name: '[!?] cheap', userid: 56, steamid: 'STEAM_0:0:12272740', team: 'Blue'}, 
    text: 'I can also play pyro. I have been doing that a lot on 2fort and doublecross.'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'chargedeployed', 
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'captureblocked',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red', position: {x: -2440, y: 4826, z: -579}},
    cpname: '#Gravelpit_cap_B'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'builtobject', 
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    object: 'OBJ_ATTACHMENT_SAPPER'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'flagdefended', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'flagcaptured', 
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue', position: {x: -1841, y: -1776, z: -30}}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    customKill: 'feign_death'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
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
    roles: [{
      key: 'scout',
      name: 'Scout'
    }],
    damage: 0,
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
    dominations: 0,
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'FSTNG! Barncow',
    userid: 53,
    steamid: 'STEAM_0:1:16481274',
    team: 'Blue',
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
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
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicks: 0,
    medPicksWithUber: 0,
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
    ]
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'Cres', 
    userid: 49, 
    steamid: 'STEAM_0:0:8581157', 
    team: 'Blue',
    roles: [],
    damage: 33,
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
    medPicks: 0,
    medPicksWithUber: 0,
    items: {
      medkit_small: 2,
      medkit_medium: 1
    },
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'Ctrl+f Muffin!', 
    userid: 50, 
    steamid: 'STEAM_0:1:9852193', 
    team: 'Red',
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
    timesDominated: 0,
    revenges: 0,
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({ 
    name: 'perl',
    userid: 57,
    steamid: 'STEAM_0:0:11710749',
    team: 'Red',
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
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
    extinguishes: 0,
    ubers: 0,
    droppedUbers: 0,
    healing: 0,
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '[!?] cheap',
    userid: 56,
    steamid: 'STEAM_0:0:12272740',
    team: 'Blue',
    roles: [],
    damage: 0,
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
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '`yay!',
    userid: 52,
    steamid: 'STEAM_0:0:973270',
    team: 'Blue',
    roles: [{
      key: 'spy',
      name: 'Spy'
    }],
    damage: 0,
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
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'ǤooB',
    userid: 54,
    steamid: 'STEAM_0:1:23384772',
    team: 'Spectator',
    roles: [],
    damage: 0,
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
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '[H2K]BubbleAlan ʚϊɞ',
    userid: 55,
    steamid: 'STEAM_0:0:556497',
    team: 'Spectator',
    roles: [{
        key: 'medic',
        name: 'Medic'
    }],
    damage: 0,
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
    healing: 0,
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'Bill',
    userid: 16,
    steamid: 'STEAM_0:0:23957009',
    team: 'Red',
    roles: [],
    damage: 0,
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
    medPicks: 0,
    medPicksWithUber: 0,
    items: {},
    healSpread: []
  });
  ++playerIndex;
  
  playerIndex.should.equal(log.players.length);
}
