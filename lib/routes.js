var Player = require('../models/Player');
var Challenge = require('../models/Challenge');
var pong = require('./pong');
var Q = require('q');
var _ = require('underscore');
var path = require('path');
var fs = require('fs');

var COMMANDS = {
  BOT_REGISTER: /^register$/i,
  BOT_RANK: /^rank(\s+(.*))?$/i,
  BOT_LEADERBOARD: /^leaderboard(\s+(.*))?$/i,
  BOT_RESET: /^reset\s+(.*)\s+(.*)$/i,
  BOT_SOURCE: /^source$/i,
  BOT_HELP: /^help$/i,
  BOT_HUG: /^hug$/i,
  BOT_SUCKS: /^sucks$/i,
  BOT_NEW_SEASON: /^new_season\s+(.*)$/i,

  CHALLENGE_RANDOM: /^(vs|challenge)\s+random$/i,
  CHALLENGE_SINGLE: /^(vs|challenge)\s+(singles?\s+)?(.*)$/i,
  CHALLENGE_DOUBLES: /^(vs|challenge)\s+(doubles?\s+)?(.*)\s+(against|vs)\s+(.*)\s+(.*)$/i,

  CHALLENGE_ACCEPT: /^(ok|accept)$/i,
  CHALLENGE_DECLINE: /^(no|decline)$/i,
  CHALLENGE_CHICKEN: /^chicken$/,

  GAME_LOST: /^lost$/i,
  GAME_WON: /^won$/i,
};

var _commands = [];

var _loadCommandsFile = function(filename) {
  var commands_path = path.join(__dirname, 'commands', filename)
  try {
    // _.merge(_commands, require(commands_path).commands);
    var commands = require(commands_path).commands
    commands.forEach(function(command) {
      _commands.push(command);
    });
  } catch (ex) {
    console.error('Could not load command file ' + filename + ' : ' +  String(ex));
  }
}

// Load Commands
var cmd_path = path.join(__dirname, 'commands');
fs.readdirSync(cmd_path).forEach(_loadCommandsFile);

module.exports.leaderboard = function (req, res) {
  res.sendFile(path.join(__dirname + '/../index.html'));
};

module.exports.index = function (req, res) {
  var hook = req.body;


  if (!hook) {
    res.json({ text: 'Something bad happened.'});
  }

  if (process.env.LOG_LEVEL === 'debug') {
    console.log(hook);
  }

  var input = _.compact(hook.text.trim().split(/\s(.+)?/));
  var command_text = input[1].trim();

  for (var i=0; i<_commands.length; i++) {
    var command_obj = _commands[i];
    if (command_obj.command.test(command_text)) {
      var params = command_text.match(command_obj.command);
      return command_obj.run(params, hook, res);
    }
  }

  // We did not find any commands
  return res.json({ text: 'I couldn\'t understand that command. Use _pongbot help_ to get a list of available commands.' });
};
