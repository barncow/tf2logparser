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

/**
  IMPORTING FROM TF2LOGS.COM:
   select concat('\'', w.key_name ,'\': {\n  key: \'', w.key_name, '\',\n  name: ', coalesce(concat('"', w.name, '"'), 'null') ,',\n  role: ', coalesce(concat('\'',r.key_name, '\''), 'false') ,'\n},\n') from weapon w left outer join role r on r.id = w.role_id order by w.key_name asc;
   
   Remove all Pipes (|)
   Indent all properties
   Remove bazooka (Day of Defeat weapon that got added to the site)
   Add tf_weapon_medigun
*/

var weapons = {
  'ambassador': {
    key: 'ambassador',
    name: "Ambassador (Bodyshot)",
    role: 'spy'
  },
                                                                                                          
 'ambassador_hs': {
  key: 'ambassador_hs',
  name: "Ambassador (Bodyshot)",
  role: 'spy'
},
                                                                                                    
 'amputator': {
    key: 'amputator',
    name: "Amputator",
    role: 'medic'
  },
                                                                                                                      
 'atomizer': {
    key: 'atomizer',
    name: "Atomizer",
    role: 'scout'
  },
                                                                                                                         
 'axtinguisher': {
    key: 'axtinguisher',
    name: "Axtinguisher",
    role: 'pyro'
  },
                                                                                                              
 'backburner': {
    key: 'backburner',
    name: "Backburner",
    role: 'pyro'
  },
                                                                                                                    
 'back_scratcher': {
    key: 'back_scratcher',
    name: "Back Scratcher",
    role: 'pyro'
  },
                                                                                                        
 'ball': {
    key: 'ball',
    name: "Sandman (Ball)",
    role: 'scout'
  },
                                                                                                                           
 'bat': {
    key: 'bat',
    name: "Bat",
    role: 'scout'
  },
                                                                                                                                        
 'battleaxe': {
    key: 'battleaxe',
    name: "Scotsman's Skullcutter",
    role: 'demoman'
  },
                                                                                                       
 'battleneedle': {
    key: 'battleneedle',
    name: "Vita-Saw",
    role: 'medic'
  },
                                                                                                                 
 'bazaar_bargain': {
    key: 'bazaar_bargain',
    name: "Bazaar Bargain",
    role: 'sniper'
  },
                                                                                                                              
 'blackbox': {
    key: 'blackbox',
    name: "Black Box",
    role: 'soldier'
  },
                                                                                                                      
 'bleed_kill': {
    key: 'bleed_kill',
    name: "Bleed Kill",
    role: false
  },
                                                                                                                     
 'blutsauger': {
    key: 'blutsauger',
    name: "Blutsauger",
    role: 'medic'
  },
                                                                                                                   
 'bonesaw': {
    key: 'bonesaw',
    name: "Bonesaw",
    role: 'medic'
  },
                                                                                                                            
 'boston_basher': {
    key: 'boston_basher',
    name: "Boston Basher",
    role: 'scout'
  },
                                                                                                          
 'bottle': {
    key: 'bottle',
    name: "Bottle",
    role: 'demoman'
  },
                                                                                                                             
 'brass_beast': {
    key: 'brass_beast',
    name: "Brass Beast",
    role: 'heavyweapons'
  },
                                                                                                         
 'bushwacka': {
    key: 'bushwacka',
    name: "Bushwacka",
    role: 'sniper'
  },
                                                                                                                     
 'candy_cane': {
    key: 'candy_cane',
    name: "Candy Cane",
    role: 'scout'
  },
                                                                                                                   
 'claidheamohmor': {
    key: 'claidheamohmor',
    name: "Claidheamh Mòr",
    role: 'demoman'
  },
                                                                                                     
 'club': {
    key: 'club',
    name: "Kukri",
    role: 'sniper'
  },
                                                                                                                                   
 'compound_bow': {
    key: 'compound_bow',
    name: "Huntsman (Flaming Arrow)",
    role: 'sniper'
  },
                                                                                                
 'crusaders_crossbow': {
    key: 'crusaders_crossbow',
    name: "Crusader's Crossbow",
    role: 'medic'
  },
                                                                                          
 'deflect_arrow': {
    key: 'deflect_arrow',
    name: "Arrow Deflect",
    role: 'pyro'
  },
                                                                                                           
 'deflect_flare': {
    key: 'deflect_flare',
    name: "Flare Deflect",
    role: 'pyro'
  },
                                                                                                           
 'deflect_promode': {
    key: 'deflect_promode',
    name: "Pipe Deflect",
    role: 'pyro'
  },
                                                                                                        
 'deflect_rocket': {
    key: 'deflect_rocket',
    name: "Rocket Deflect",
    role: 'pyro'
  },
                                                                                                        
 'deflect_sticky': {
    key: 'deflect_sticky',
    name: "Sticky Deflect",
    role: 'demoman'
  },
                                                                                                     
 'degreaser': {
    key: 'degreaser',
    name: "Degreaser",
    role: 'pyro'
  },
                                                                                                                       
 'demokatana': {
    key: 'demokatana',
    name: "Half-Zatoichi",
    role: 'demoman'
  },
                                                                                                              
 'demoshield': {
    key: 'demoshield',
    name: "Chargin' Targe",
    role: 'demoman'
  },
                                                                                                             
 'detonator': {
    key: 'detonator',
    name: "Detonator",
    role: 'pyro'
  },
                                                                                                                       
 'disciplinary_action': {
    key: 'disciplinary_action',
    name: "Disciplinary Action",
    role: 'soldier'
  },
                                                                                      
 'enforcer': {
    key: 'enforcer',
    name: "Enforcer",
    role: 'spy'
  },
                                                                                                                           
 'eternal_reward': {
    key: 'eternal_reward',
    name: "Eternal Reward",
    role: 'spy'
  },
                                                                                                         
 'eternal_reward_bs': {
    key: 'eternal_reward_bs',
    name: "Eternal Reward (Backstab)",
    role: 'spy'
  },
                                                                                        
 'family_business': {
    key: 'family_business',
    name: "Family Business",
    role: 'heavyweapons'
  },
                                                                                             
 'fireaxe': {
    key: 'fireaxe',
    name: "Fireaxe",
    role: 'pyro'
  },
                                                                                                                             
 'fists': {
    key: 'fists',
    name: "Fists",
    role: 'heavyweapons'
  },
                                                                                                                           
 'flamethrower': {
    key: 'flamethrower',
    name: "Flamethrower",
    role: 'pyro'
  },
                                                                                                              
 'flaregun': {
    key: 'flaregun',
    name: "Flaregun",
    role: 'pyro'
  },
                                                                                                                          
 'force_a_nature': {
    key: 'force_a_nature',
    name: "Force-A-Nature",
    role: 'scout'
  },
                                                                                                       
 'frontier_justice': {
    key: 'frontier_justice',
    name: "Frontier Justice",
    role: 'engineer'
  },
                                                                                              
 'fryingpan': {
    key: 'fryingpan',
    name: "Frying Pan",
    role: false
  },
                                                                                                                       
 'gloves': {
    key: 'gloves',
    name: "K.G.B.",
    role: 'heavyweapons'
  },
                                                                                                                        
 'gloves_running_urgently': {
    key: 'gloves_running_urgently',
    name: "Gloves of Running Urgently",
    role: 'heavyweapons'
  },
                                                                  
 'headtaker': {
    key: 'headtaker',
    name: "Horseless Headless Horsemann's Headtaker",
    role: 'demoman'
  },
                                                                                     
 'holy_mackerel': {
    key: 'holy_mackerel',
    name: "Holy Mackerel",
    role: 'scout'
  },
                                                                                                          
 'iron_curtain': {
    key: 'iron_curtain',
    name: "Iron Curtain",
    role: 'heavyweapons'
  },
                                                                                                      
 'knife': {
    key: 'knife',
    name: "Knife",
    role: 'spy'
  },
                                                                                                                                    
 'knife_bs': {
    key: 'knife_bs',
    name: "Knife (Backstab)",
    role: 'spy'
  },
                                                                                                                   
 'kunai': {
    key: 'kunai',
    name: "Connivers's Kunai",
    role: 'spy'
  },
                                                                                                                        
 'kunai_bs': {
    key: 'kunai_bs',
    name: "Connivers's Kunai (Backstab)",
    role: 'spy'
  },
                                                                                                       
 'lava_axe': {
    key: 'lava_axe',
    name: "Sharpened Volcano Fragment",
    role: 'pyro'
  },
                                                                                                        
 'lava_bat': {
    key: 'lava_bat',
    name: "Sun-on-a-Stick",
    role: 'scout'
  },
                                                                                                                   
 'letranger': {
    key: 'letranger',
    name: "L'Etranger",
    role: 'spy'
  },
                                                                                                                       
 'liberty_launcher': {
    key: 'liberty_launcher',
    name: "Liberty Launcher",
    role: 'soldier'
  },
                                                                                               
 'loch_n_load': {
    key: 'loch_n_load',
    name: "Loch-n-Load",
    role: 'demoman'
  },
                                                                                                              
 'market_gardener': {
    key: 'market_gardener',
    name: "Market Gardener",
    role: 'soldier'
  },
                                                                                                  
 'maxgun': {
    key: 'maxgun',
    name: "Lugermorph",
    role: false
  },
                                                                                                                             
 'minigun': {
    key: 'minigun',
    name: "Minigun",
    role: 'heavyweapons'
  },
                                                                                                                     
 'natascha': {
    key: 'natascha',
    name: "Natascha",
    role: 'heavyweapons'
  },
                                                                                                                  
 'obj_minisentry': {
    key: 'obj_minisentry',
    name: "Combat Mini-Sentry",
    role: 'engineer'
  },
                                                                                                
 'obj_sentrygun': {
    key: 'obj_sentrygun',
    name: "Sentry Gun Level 1",
    role: 'engineer'
  },
                                                                                                  
 'obj_sentrygun2': {
    key: 'obj_sentrygun2',
    name: "Sentry Gun Level 2",
    role: 'engineer'
  },
                                                                                                
 'obj_sentrygun3': {
    key: 'obj_sentrygun3',
    name: "Sentry Gun Level 3",
    role: 'engineer'
  },
                                                                                                
 'paintrain': {
    key: 'paintrain',
    name: "Pain Train",
    role: false
  },
                                                                                                                       
 'persian_persuader': {
    key: 'persian_persuader',
    name: "Persian Persuader",
    role: 'demoman'
  },
                                                                                            
 'pistol': {
    key: 'pistol',
    name: "Engineer's Pistol",
    role: 'engineer'
  },
                                                                                                                 
 'pistol_scout': {
    key: 'pistol_scout',
    name: "Scout's Pistol",
    role: 'scout'
  },
                                                                                                           
 'player': {
    key: 'player',
    name: "Player",
    role: false
  },
                                                                                                                                 
 'powerjack': {
    key: 'powerjack',
    name: "Powerjack",
    role: 'pyro'
  },
                                                                                                                       
 'proto_syringe': {
    key: 'proto_syringe',
    name: "Overdose",
    role: 'medic'
  },
                                                                                                               
 'reserve_shooter': {
    key: 'reserve_shooter',
    name: "Reserve Shooter",
    role: 'soldier'
  },
                                                                                                  
 'revolver': {
    key: 'revolver',
    name: "Revolver",
    role: 'spy'
  },
                                                                                                                           
 'robot_arm': {
    key: 'robot_arm',
    name: "Gunslinger",
    role: 'engineer'
  },
                                                                                                                  
 'robot_arm_blender_kill': {
    key: 'robot_arm_blender_kill',
    name: "Organ Grinder",
    role: 'engineer'
  },
                                                                                     
 'robot_arm_combo_kill': {
    key: 'robot_arm_combo_kill',
    name: "Gunslinger Triple Punch",
    role: 'engineer'
  },
                                                                               
 'rocketlauncher_directhit': {
    key: 'rocketlauncher_directhit',
    name: "Direct Hit",
    role: 'soldier'
  },
                                                                                     
 'samrevolver': {
    key: 'samrevolver',
    name: "Big Kill",
    role: 'spy'
  },
                                                                                                                     
 'sandman': {
    key: 'sandman',
    name: "Sandman (Bat)",
    role: 'scout'
  },
                                                                                                                      
 'scattergun': {
    key: 'scattergun',
    name: "Scattergun",
    role: 'scout'
  },
                                                                                                                   
 'scout_sword': {
    key: 'scout_sword',
    name: "Three-Rune Blade",
    role: 'scout'
  },
                                                                                                           
 'short_stop': {
    key: 'short_stop',
    name: "Short Stop",
    role: 'scout'
  },
                                                                                                                   
 'shotgun_hwg': {
    key: 'shotgun_hwg',
    name: "Heavy's Shotgun",
    role: 'heavyweapons'
  },
                                                                                                     
 'shotgun_primary': {
    key: 'shotgun_primary',
    name: "Engineer's Shotgun",
    role: 'engineer'
  },
                                                                                              
 'shotgun_pyro': {
    key: 'shotgun_pyro',
    name: "Pyro's Shotgun",
    role: 'pyro'
  },
                                                                                                            
 'shotgun_soldier': {
    key: 'shotgun_soldier',
    name: "Soldier's Shotgun",
    role: 'soldier'
  },
                                                                                                
 'shovel': {
    key: 'shovel',
    name: "Shovel",
    role: 'soldier'
  },
                                                                                                                             
 'sledgehammer': {
    key: 'sledgehammer',
    name: "Homewrecker",
    role: 'pyro'
  },
                                                                                                               
 'smg': {
    key: 'smg',
    name: "SMG",
    role: 'sniper'
  },
                                                                                                                                       
 'sniperrifle': {
    key: 'sniperrifle',
    name: "Sniper Rifle (Bodyshot)",
    role: 'sniper'
  },
                                                                                                   
 'sniperrifle_hs': {
    key: 'sniperrifle_hs',
    name: "Sniper Rifle (Headshot)",
    role: 'sniper'
  },
                                                                                             
 'soda_popper': {
    key: 'soda_popper',
    name: "Soda Popper",
    role: 'scout'
  },
                                                                                                                
 'solemn_vow': {
    key: 'solemn_vow',
    name: "Solemn Vow",
    role: 'medic'
  },
                                                                                                                   
 'southern_hospitality': {
    key: 'southern_hospitality',
    name: "Southern Hospitality",
    role: 'engineer'
  },
                                                                                  
 'splendid_screen': {
    key: 'splendid_screen',
    name: "Splendid Screen",
    role: 'demoman'
  },
                                                                                                  
 'steel_fists': {
    key: 'steel_fists',
    name: "Fists of Steel",
    role: 'heavyweapons'
  },
                                                                                                      
 'sticky_resistance': {
    key: 'sticky_resistance',
    name: "Scottish Resistance",
    role: 'demoman'
  },
                                                                                          
 'sword': {
    key: 'sword',
    name: "Eyelander",
    role: 'demoman'
  },
                                                                                                                            
 'sydney_sleeper': {
    key: 'sydney_sleeper',
    name: "Sydney Sleeper",
    role: 'sniper'
  },
                                                                                                      
 'syringegun_medic': {
    key: 'syringegun_medic',
    name: "Syringe Gun",
    role: 'medic'
  },
                                                                                                      
 'taunt_demoman': {
    key: 'taunt_demoman',
    name: "Decapitation",
    role: 'demoman'
  },
                                                                                                         
 'taunt_guitar_kill': {
    key: 'taunt_guitar_kill',
    name: "Dischord",
    role: 'engineer'
  },
                                                                                                    
 'taunt_heavy': {
    key: 'taunt_heavy',
    name: "Showdown",
    role: 'heavyweapons'
  },
                                                                                                            
 'taunt_pyro': {
    key: 'taunt_pyro',
    name: "Hadouken",
    role: 'pyro'
  },
                                                                                                                      
 'taunt_scout': {
    key: 'taunt_scout',
    name: "Home Run",
    role: 'scout'
  },
                                                                                                                   
 'taunt_sniper': {
    key: 'taunt_sniper',
    name: "Skewer",
    role: 'sniper'
  },
                                                                                                                  
 'taunt_soldier': {
    key: 'taunt_soldier',
    name: "Kamikaze",
    role: 'soldier'
  },
                                                                                                             
 'taunt_soldier_lumbricus': {
    key: 'taunt_soldier_lumbricus',
    name: "Kamikaze",
    role: 'soldier'
  },
                                                                                         
 'taunt_spy': {
    key: 'taunt_spy',
    name: "Fencing",
    role: 'spy'
  },
                                                                                                                          
 'telefrag': {
    key: 'telefrag',
    name: "Telefrag",
    role: false
  },
                                                                                                                           
 'tf_projectile_arrow': {
    key: 'tf_projectile_arrow',
    name: "Huntsman (Bodyshot)",
    role: 'sniper'
  },
                                                                                       
 'tf_projectile_arrow_hs': {
    key: 'tf_projectile_arrow_hs',
    name: "Huntsman (Headshot)",
    role: 'sniper'
  },
                                                                                 
 'tf_projectile_healing_bolt': {
    key: 'tf_projectile_healing_bolt',
    name: "Crusader's Crossbow (Heal)",
    role: 'medic'
  },
                                                                   
 'tf_projectile_pipe': {
    key: 'tf_projectile_pipe',
    name: "Pipe Launcher",
    role: 'demoman'
  },
                                                                                              
 'tf_projectile_pipe_remote': {
    key: 'tf_projectile_pipe_remote',
    name: "Sticky Launcher",
    role: 'demoman'
  },
                                                                              
 'tf_projectile_rocket': {
    key: 'tf_projectile_rocket',
    name: "Rocket Launcher",
    role: 'soldier'
  },
                                                                                        
 'tf_pumpkin_bomb': {
    key: 'tf_pumpkin_bomb',
    name: "Pumpkin Bomb",
    role: false
  },
  
  'tf_weapon_medigun': {
    key: 'tf_weapon_medigun',
    name: 'Medigun',
    role: 'medic'
  },
                                                                                                         
 'the_winger': {
    key: 'the_winger',
    name: "Winger",
    role: 'scout'
  },
                                                                                                                       
 'tomislav': {
    key: 'tomislav',
    name: "Tomislav",
    role: 'heavyweapons'
  },
                                                                                                                  
 'tribalkukri': {
    key: 'tribalkukri',
    name: "Tribalman's Shiv",
    role: 'sniper'
  },
                                                                                                          
 'ubersaw': {
    key: 'ubersaw',
    name: "Ubersaw",
    role: 'medic'
  },
                                                                                                                            
 'ullapool_caber': {
    key: 'ullapool_caber',
    name: "Ullapool Caber",
    role: 'demoman'
  },
                                                                                                     
 'ullapool_caber_explosion': {
    key: 'ullapool_caber_explosion',
    name: "Ullapool Caber (Explosion)",
    role: 'demoman'
  },
                                                                     
 'unique_pickaxe': {
    key: 'unique_pickaxe',
    name: "Unique Equalizer",
    role: 'soldier'
  },
                                                                                                     
 'warfan': {
    key: 'warfan',
    name: "Fan O'War",
    role: 'scout'
  },
                                                                                                                            
 'warrior_spirit': {
    key: 'warrior_spirit',
    name: "Warrior's Spirit",
    role: 'heavyweapons'
  },
                                                                                              
 'world': {
    key: 'world',
    name: "World",
    role: false
  },
                                                                                                                                    
 'wrangler_kill': {
    key: 'wrangler_kill',
    name: "Wrangler",
    role: 'engineer'
  },
                                                                                                            
 'wrench': {
    key: 'wrench',
    name: "Wrench",
    role: 'engineer'
  },
                                                                                                                            
 'wrench_jag': {
    key: 'wrench_jag',
    name: "Jag",
    role: 'engineer'
  }
}

//exposing for users
module.exports.weapons = weapons;
