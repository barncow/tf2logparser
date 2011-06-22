/**
  This object contains methods and data to translate an in-log weapon name to something human readable, and linked to a role.
*/

/**
  Gets the weapon information for the given weapon name from the log.
  If not found, a dummy object will be returned with the weapon name as the weapon's full name, and false as the role.
  @param weapon string from the log file.
  @param customkill optional string from the customkill paren value of log file. Adjusts key searches for backstab and headshot weapon variants.
*/
module.exports.findWeapon = function(weapon, customkill) {
  if(!weapon) return false;
  
  //adjust weapon key for headshots and backstabs
  if(customkill == 'headshot') weapon += '_hs';
  else if(customkill == 'backstab') weapon += '_bs';
  
  if(weapons[weapon] !== undefined) return weapons[weapon];
  else return { //if the weapon could not be found, construct a similar object using the weapon name as the title.
    key: weapon,
    name: weapon,
    role: false
  };
};

/**
  List of weapons, their full names, and the roles they are assigned to.
  If a weapon can be used by more than one class (role), assign it to false.
  Defining this via a local variable to make its use in local methods easier.
  Keys are defined twice - once for easy lookup by key, and another so that the 
  object still retains that information, in case things need to be updated.
*/
var weapons = {
  'knife': {
    key: 'knife',
    name: 'Knife',
    role: 'spy'
  },
  'knife_bs': {
    key: 'knife_bs',
    name: 'Knife (Backstab)',
    role: 'spy'
  },
  'scattergun': {
    key: 'scattergun',
    name: 'Scattergun',
    role: 'scout'
  },
  'sniperrifle': {
    key: 'sniperrifle',
    name: 'Sniper Rifle (Bodyshot)',
    role: 'sniper'
  },
  'sniperrifle_hs': {
    key: 'sniperrifle_hs',
    name: 'Sniper Rifle (Headshot)',
    role: 'sniper'
  },
  'tf_projectile_rocket': {
    key: 'tf_projectile_rocket',
    name: 'Rocket Launcher',
    role: 'soldier'
  },
  'tf_weapon_medigun': {
    key: 'tf_weapon_medigun',
    name: 'Medigun',
    role: 'medic'
  },
  'world': {
    key: 'world',
    name: 'World',
    role: false
  }
}

//exposing for users
module.exports.weapons = weapons;