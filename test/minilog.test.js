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
    //parser.ignoreUnrecognizedLines = false;
    parser.parseLogFile(FP+'/mini.log', function(err, log) {
      should.not.exist(err);
      
      log.should.be.ok;
      
      //broke out these assertions to help narrow down any potential problems.
      
      log.blueScore.should.eql(0);
      log.redScore.should.eql(0);
      log.elapsedTime.should.eql(0);
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
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red'}, 
    weapon: 'scattergun', 
    customkill: false
  });
  ++eventIndex;
      
  log.events[eventIndex].should.eql({
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: 'FSTNG! Barncow', userid: 48, steamid: 'STEAM_0:1:16481274', team: 'Red'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    weapon: 'tf_projectile_rocket', 
    customkill: 'suicide'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    weapon: 'scattergun', 
    customkill: false
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
    player: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'}, 
    victim: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    weapon: 'minigun', 
    customkill: 'OBJ_SENTRYGUN'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'}, 
    weapon: 'pda_engineer', 
    customkill: 'OBJ_TELEPORTER'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    victim: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    weapon: 'sniperrifle', 
    customkill: 'headshot'
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
    weapon: 'tf_weapon_medigun'
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
    weapon: 'world', 
    customkill: 'suicide', 
    healing: 160, 
    ubercharge: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'Ctrl+f Muffin!', userid: 50, steamid: 'STEAM_0:1:9852193', team: 'Red'}, 
    victim: {name: 'FSTNG! Barncow', userid: 53, steamid: 'STEAM_0:1:16481274', team: 'Blue'}, 
    weapon: 'sniperrifle', 
    customkill: false, 
    healing: 1800, 
    ubercharge: true
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'}, 
    weapon: 'knife', 
    customkill: 'backstab'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'builtobject', 
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    object: 'OBJ_ATTACHMENT_SAPPER'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: 'Target', userid: 46, steamid: 'STEAM_0:0:6845279', team: 'Blue'}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}, 
    weapon: 'scattergun', 
    customkill: 'feign_death'
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'assist', 
    player: {name: 'Cres', userid: 49, steamid: 'STEAM_0:0:8581157', team: 'Blue'}, 
    victim: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Red'}
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue'}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'}, 
    weapon: 'sadfsgtghgher', 
    customkill: false
  });
  ++eventIndex;
  
  log.events[eventIndex].should.eql({
    type: 'kill',
    player: {name: '`yay!', userid: 52, steamid: 'STEAM_0:0:973270', team: 'Blue'}, 
    victim: {name: 'perl', userid: 57, steamid: 'STEAM_0:0:11710749', team: 'Red'}, 
    weapon: 'sadfsgtghgher', 
    customkill: false
  });
  ++eventIndex;
}

function checkPlayerStats(log) {
  var playerIndex = 0;
  
  log.players[playerIndex].should.eql({ 
    name: 'Target',
    userid: 46,
    steamid: 'STEAM_0:0:6845279',
    team: 'Red',
    roles: [],
    damage: 0,
    kills: 3,
    deaths: 1,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: 'FSTNG! Barncow',
    userid: 53,
    steamid: 'STEAM_0:1:16481274',
    team: 'Blue',
    roles: [],
    damage: 0,
    kills: 0,
    deaths: 2,
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
    roles: [],
    damage: 0,
    kills: 2,
    deaths: 2,
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({ 
    name: 'perl',
    userid: 57,
    steamid: 'STEAM_0:0:11710749',
    team: 'Red',
    roles: [],
    damage: 0,
    kills: 0,
    deaths: 3,
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
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '`yay!',
    userid: 52,
    steamid: 'STEAM_0:0:973270',
    team: 'Blue',
    roles: [],
    damage: 0,
    kills: 3,
    deaths: 1,
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
    items: {},
    healSpread: []
  });
  ++playerIndex;
    
  log.players[playerIndex].should.eql({
    name: '[H2K]BubbleAlan ʚϊɞ',
    userid: 55,
    steamid: 'STEAM_0:0:556497',
    team: 'Spectator',
    roles: [],
    damage: 0,
    kills: 0,
    deaths: 1,
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
    items: {},
    healSpread: []
  });
  ++playerIndex;
}
