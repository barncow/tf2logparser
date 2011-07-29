/**
  This object is a library to hold functions to help with parsing.
*/

var BigIntLib = require('./biginteger'); //don't directly ref the BigInteger object here, do it when creating new object.

/**
  Providing a function to escape regular expression special characters from a string.
  http://simonwillison.net/2006/Jan/20/escape/#p-6
*/
if(!RegExp.escape) {
  RegExp.escape = function(str) {
    var specials = new RegExp("[.*+?|()\\[\\]{}\\\\]", "g");
    return str.replace(specials, "\\$&");
  }
}

/**
  Providing a trim function, by Douglas Crockford.
  http://javascript.crockford.com/remedial.html
*/
if (!String.prototype.trim) {
  String.prototype.trim = function () {
      return this.replace(/^\s*(\S*(?:\s+\S+)*)\s*$/, "$1");
  };
}

/**
  Gets the timestamp out of the logLine.
  If the logLine is corrupt, this function will return the value false.
  @param logLine string representing the entire log line.
*/
module.exports.getTimestamp = function(logLine) {
  var matches = logLine.match(/^L (\d\d)\/(\d\d)\/(\d\d\d\d) - (\d\d):(\d\d):(\d\d)/);
  if(!matches || matches.length == 0) return false; //corrupt line
  return new Date(parseInt(matches[3],10), parseInt(matches[1],10)-1, parseInt(matches[2],10), parseInt(matches[4],10), parseInt(matches[5],10), parseInt(matches[6],10), 0);
};

/**
  Returns the number of seconds between the two dates (d1-d2)/1000
  @param d1 Date object to subtract from
  @param d2 Date object to subtract
*/
module.exports.getTimestampDifference = function(d1, d2) {
  if(d1 && d2) return Math.ceil((d1.getTime()-d2.getTime())/1000);
  else return false;
}

/**
  Gets the log line details, which is the string of chars after the timestamp.
  If there is nothing after the timestamp, this will return the value false.
  @param logLine string representing the entire log line.
*/
module.exports.getLogLineDetails = function(logLine) {
  if(!logLine) return false;
  var matches = logLine.match(/^L \d\d\/\d\d\/\d\d\d\d \- \d\d:\d\d:\d\d: (.+)/);
  if(!matches || matches.length == 0) return false; //corrupt line
  return matches[1];
};

/**
  This will get the map, if possible, from the given string.
  @param logLineDetails logLine with timestamp information.
*/
module.exports.getMap = function(logLineDetails) {
  var matches = logLineDetails.match(/^Current map "(.+?)"/);
  if(!matches || matches.length == 0) {
    //no matches, check other version
    matches = logLineDetails.match(/^Loading map "(.+?)"/);
    if(!matches || matches.length == 0) {
      //no matches, check another version
      matches = logLineDetails.match(/^Started map "(.+?)"/);
      if(!matches || matches.length == 0) {
        return false; //still no matches, therefore not a map line.
      }
    }
  }
  return matches[1];
};

/**
  Searches the beginning of the logLineDetails string for the type of the line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
  @param type string to search for
  */
module.exports.isLogLineOfType = function(logLineDetails, type) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(new RegExp("^"+RegExp.escape(type)));
  return Boolean(matches && matches.length > 0);
};

/**
  Scrubs the line of any IPs and corrupt lines.
  If a line is an "rcon from" (indicating rcon commands being sent),
  or starts with "!" (indicating sourcemod command in chat), then empty string is returned.
  @param logLine string representing the entire log line.
  TODO: catch any corrupt line?
*/
module.exports.scrubLogLine = function(logLine) {
  var timestamp = module.exports.getTimestamp(logLine),
      logLineDetails = module.exports.getLogLineDetails(logLine);

  if(!timestamp || !logLineDetails) return ''; //corrupt line
  if(module.exports.isLogLineOfType(logLineDetails, 'rcon from')) return ''; //hide in case of sensitive data

  var text = module.exports.getPlayerLineActionDetail(logLineDetails);
  if(module.exports.isLogLineOfType(logLineDetails, '"')
    && module.exports.getPlayerLineAction(logLineDetails) == 'say'
    && (text.charAt(0) == '!' || text.charAt(0) == '/')) return ''; //hide in case of sensitive data

  return logLine.replace(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g, "255.255.255.255");
};

/**
  Retrieves the action for a player line.
  A player line is a line that starts with player information after the timestamp.
  The action is the text from the start of the first player information to a
  breaking punctuation, or the end of the string.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getPlayerLineAction = function(logLineDetails) {
  var matches = logLineDetails.match(/^\".+?<\d+?><[A-Za-z0-9:_]+?><\w*?>\" ([\w ,]+)/);
  if(matches && matches.length > 0) {
    return (matches[1]).trim();
  } else return false
};


/**
  Retrieves the value in quotes immediately following the playerLineAction
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getPlayerLineActionDetail = function(logLineDetails) {
  var matches = logLineDetails.match(/^\".+?<\d+?><[A-Za-z0-9:_]+?><\w*?>\" [\w ]+? \"(.+?)\"( |$)/);
  if(matches && matches.length > 0) {
    return (matches[1]).trim();
  } else return false
};

/**
  Retrieves the value from a parenthetical wrapped value.
  ie. (ubercharge "1") will return the string 1
  @param logLineDetails result from ParsingUtils#getLogLineDetails
  @param type which parenthetical value to retrieve. For instance, in the example above, use "ubercharge"
*/
module.exports.getParenValue = function(logLineDetails, type) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(new RegExp('\('+RegExp.escape(type)+' "(.+?)"\)'));
  if(matches && matches.length >= 3) {
    return (matches[2]).trim();
  } else return false
};
var getParenValue = module.exports.getParenValue; //defining an alias for easier reference

/**
  If given a line for medic_death, will return true if the medic died with uber, or false if not.
  Also returns false if the line is not a medic_death line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.didMedicDieWithUber = function(logLineDetails) {
  return getParenValue(logLineDetails, 'ubercharge') == '1';
};

/**
  Gets the quoted value after a world trigger
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getWorldTriggerAction = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/\"(.+?)\"/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else return false
};


/**
  Gets the team for a team line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getTeamFromTeamLine = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^Team \"(.+?)\"/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else return false
};


/**
  Gets the action for a team line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getTeamAction = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^Team \"(.+?)\" (.+?) \"/);
  if(matches && matches.length > 1) {
    return (matches[2]);
  } else return false
};


/**
  Gets the trigger action for a team line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getTeamTriggerAction = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^Team \"(.+?)\" triggered \"(.+?)\"/);
  if(matches && matches.length > 1) {
    return (matches[2]);
  } else return false
};

/**
  Gets the score for a team score line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getTeamScore = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^Team \"(.+?)\" (current|final) score \"(\d+?)\"/);
  if(matches && matches.length > 2) {
    return parseInt(matches[3], 10);
  } else return false
};

/**
  Gets the number of players for a team score line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getTeamNumberPlayers = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^Team \"(.+?)\" (current|final) score \"(\d+?)\" with \"(\d+?)\"/);
  if(matches && matches.length > 3) {
    return (matches[4]);
  } else return false
};

/**
  For a server_cvar line, gets the value in the first set of quotes, which will be the cvarname.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getServerCvarName = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^server_cvar: \"(.+)\" \".+\"$/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else return false
};

/**
  For a server_cvar line, gets the value in the second set of quotes, which will be the cvar value.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getServerCvarValue = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/^server_cvar: \".+\" \"(.+)\"$/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else return false;
};

/**
	this will get the weapon for the loglinedetails given.
	@param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getWeapon = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/ with \"(.+?)\"/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else {
    //still here, try getting weapon from (weapon "scattergun")
    var wep = getParenValue(logLineDetails, 'weapon');
    if(wep !== false) return wep;
    else return false;
  }
};

/**
  Takes in a string representing coordinates, and converts it to an object.
  @param s string from the log, such as "136 733 -183"
*/
module.exports.getCoords = function(s) {
  if(typeof s != 'string') return false;
  var matches = s.match(/(-?\d+) (-?\d+) (-?\d+)/);
  if(matches && matches.length > 0) {
    return {
      x: parseInt(matches[1], 10),
      y: parseInt(matches[2], 10),
      z: parseInt(matches[3], 10)
    };
  } else return false;
}

/**
  Retrieves the "attacker" or "victim" coordinates in a kill line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
  @param type type of coordinates, either attacker or victim.
*/
module.exports.getKillCoords = function(logLineDetails, type) {
  if(typeof logLineDetails != 'string') return false;
  var pos = module.exports.getCoords(getParenValue(logLineDetails, type+'_position'));
  if(pos !== false) return pos;
  else return false;
};

/**
  Retrieves the position reported when the cvar log_verbose_enabled is set to 1
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getReportedPosition = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var pos = module.exports.getCoords(getParenValue(logLineDetails, 'position'));
  if(pos === false) return false;
  else return pos;
};

/**
  Retrieves cpname from a point captured line.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getCapturePointName = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'cpname');
  if(s !== false) return s;
  else return false;
};

/**
  Retrieves the healing value. Will try to get the official version, the Supplemental Stats version, and SuperLogs
  Will return results as an integer.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getHealing = function(logLineDetails) {
  //official paren value, along with newer supplemental stats version.
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'healing');
  if(s !== false) return parseInt(s, 10);
  else {
    //still here, did not get the healing value. Try the supplemental stats version.
    var matches = logLineDetails.match(/triggered "healed" (\d+?) against/);
    if(matches && matches.length > 0) {
      return parseInt(matches[1], 10);
    } else {
      //still here, did not get the healing value. Try the superlogs version.
      s = getParenValue(logLineDetails, 'heal');
      if(s !== false) return parseInt(s, 10);
      else return false;
    }
  }
};

/**
  Retrieves the damage value for Supplemental Stats (any version), and SuperLogs
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getDamage = function(logLineDetails) {
  //returning zero instead of false because if no value is found, we really don't care.
  if(typeof logLineDetails != 'string') return 0;

  //Supplemental Stats (newer version) and SuperLogs damage
  var s = getParenValue(logLineDetails, 'damage');
  if(s !== false) return parseInt(s, 10);
  else {
    //cinq's damage plugin - v1
    var matches = logLineDetails.match(/ (\d+)$/);
    if(matches && matches.length > 0) {
      return parseInt(matches[1], 10);
    } else return 0;
  }
};

/**
  Retrieves the event value for a flagevent.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getFlagEvent = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'event');
  if(s !== false) return s;
  else return false;
};

/**
  Retrieves team name from round_win event
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getRoundWinTeam = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'winner');
  if(s !== false) return s;
  else return false;
};

/**
  Retrieves customkill from kill event
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getCustomKill = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'customkill');
  if(s !== false) return s;
  else return false;
};

/**
  Retrieves object from built_object
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getObjectFromBuiltObject = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var s = getParenValue(logLineDetails, 'object');
  if(s !== false) return s;
  else return false;
};

/**
  Retrieves item from picked up item line
  @param logLineDetails result from ParsingUtils#getLogLineDetails
*/
module.exports.getPickedUpItemKeyName = function(logLineDetails) {
  if(typeof logLineDetails != 'string') return false;
  var matches = logLineDetails.match(/ picked up item "(.+?)"$/);
  if(matches && matches.length > 0) {
    return (matches[1]);
  } else return false;
};

/**
  Retrieves all players from the string, and will place them into an array in the same order.
  @param logLineDetails result from ParsingUtils#getLogLineDetails
  @param ignoreBots true/false, if true, and the line has a bot, this method will return false.
*/
module.exports.getPlayers = function(logLineDetails, ignoreBots) {
  if(typeof logLineDetails != 'string') return false;

  var regexp = /([^"]+?)<(\d+?)><(.+?)><(.*?)>"/g,
    matches,
    players = [];

  //the standard javascript matches function, when given the global flag,
  //will only return the complete matched portions of the string, not
  //a parameterized array of its values. Use the RegExp.exec function instead.
  while(matches = regexp.exec(logLineDetails)) {
    if(matches[3] == 'Console') return false; //if Console is involved, pitch the line entirely.

    if(matches[3] == 'BOT') {
      if(ignoreBots) return false; //if there is a bot, and ignoreBots is true, return false and pitch the line.
      else matches[3] = 'BOT:' + matches[1];
    }

    players.push({
      name: matches[1],
      userid: parseInt(matches[2], 10),
      steamid: matches[3],
      team: matches[4] || null
    });
  }

  if(players.length > 0) return players;
  else return false;
}

/**
  Converts a steam id (ie. STEAM_0:1:16481274) to a friend id (ie. 76561197993228277) and vice-versa.
  Friend IDs should always be stored as Strings, to prevent rounding errors.
  Based on:
  http://forums.alliedmods.net/showpost.php?p=565979&postcount=16
  http://forums.alliedmods.net/showpost.php?p=565979&postcount=118
  @param id either a steam id or a friend id. Will be converted to the other version.
*/
module.exports.convertSteamFriendId = function(id) {
  const ID_ADDEND = new BigIntLib.BigInteger('76561197960265728');

  var matches = id.match(/^STEAM_(\d):(\d):(\d+)$/);
  if(matches && matches.length > 0) {
    //steamid -> friendid
    var server = new BigIntLib.BigInteger(matches[2]), authId = new BigIntLib.BigInteger(matches[3]);
    return authId.multiply(new BigIntLib.BigInteger('2')).add(ID_ADDEND).add(server).toString();
  }

  matches = id.match(/^\d+$/)
  if(matches && matches.length > 0) {
    //friend id -> steam id
    id = new BigIntLib.BigInteger(id);
    var server = id.remainder(new BigIntLib.BigInteger('2')), authId = id.subtract(ID_ADDEND).subtract(server).divide(new BigIntLib.BigInteger('2'));
    return 'STEAM_0:'+server.toString()+':'+authId;
  }

  //still here, return false.
  return false;
}

