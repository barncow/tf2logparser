/**
  This object contains methods and data to translate an in-log role(class) name to something human readable.
*/

/**
  Gets the role information for the given role name from the log.
  If not found, false is returned.
  @param role string from the log file.
*/
module.exports.findRole = function(role) {
  if(!role) return false;
  
  if(roles[role] !== undefined) return roles[role];
  else return false;
};

/**
  List of roles and their full names.
  Defining this via a local variable to make its use in local methods easier.
  Keys are defined twice - once for easy lookup by key, and another so that the 
  object still retains that information, in case things need to be updated.
*/
var roles = {
  'scout': {
    key: 'scout',
    name: 'Scout'
  },
  'heavyweapons': {
    key: 'heavyweapons',
    name: 'Heavy'
  },
  'sniper': {
    key: 'sniper',
    name: 'Sniper'
  },
  'medic': {
    key: 'medic',
    name: 'Medic'
  },
  'spy': {
    key: 'spy',
    name: 'Spy'
  },
  'soldier': {
    key: 'soldier',
    name: 'Soldier'
  },
  'demo': {
    key: 'demo',
    name: 'Demo'
  },
  'engineer': {
    key: 'engineer',
    name: 'Engineer'
  },
  'pyro': {
    key: 'pyro',
    name: 'Pyro'
  }
}

//exposing for users
module.exports.roles = roles;