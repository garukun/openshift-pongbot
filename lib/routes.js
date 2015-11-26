var Player = require('../models/Player');
var Challenge = require('../models/Challenge');
var pong = require('./pong');
var Q = require('q');
var _ = require('underscore');
var path = require('path');

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

module.exports.leaderboard = function (req, res) {
  res.sendFile(path.join(__dirname + '/../index.html'));
};

module.exports.index = function (req, res) {
  var hook = req.body;

  if (hook) {

    if (process.env.LOG_LEVEL === 'debug') {
      console.log(hook);
    }

    var input = _.compact(hook.text.trim().split(/\s(.+)?/));
    var command = input[1].trim();

    if (COMMANDS.BOT_REGISTER.test(command)) {
      var promises = [];
      promises.push(pong.findPlayer(hook.user_name));
      if (hook.user_id) {
        promises.push(pong.findPlayer('<@' + hook.user_id + '>'));
      }
      Q.any(promises).then(
        function (player) {
          res.json({ text: "You've already registered!" });
        },
        function (err) {
          pong.registerPlayer(hook.user_name, { user_id: hook.user_id }).then(function (player) {
            res.json({ text: 'Successfully registered! Welcome to the system, ' + hook.user_name + '.' });
          }, function (err) {
            res.json({ text: err.toString() });
          });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_DOUBLES.test(command)) {
      var params = command.match(COMMANDS.CHALLENGE_DOUBLES);
      pong.findPlayer(hook.user_name).then(
        function (player) {
          return pong.createDoubleChallenge(hook.user_name, params[3], params[5], params[6]).then(
            function (result) {
              return pong.getDuelGif().then(function (url) {
                res.json({ text: result.message + ' ' + url });
              });
            },
            function (err) {
              return res.json({ text: err.toString() });
            }
          );
        },
        function (err) {
          res.json({ text: err.message + " Are you registered? Use _pongbot register_ first." });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_RANDOM.test(command)) {
      var params = command.match(COMMANDS.CHALLENGE_SINGLE);
      pong.findPlayer(hook.user_name).then(
        function (player) {
          return pong.createSingleRandomChallenge(hook.user_name).then(
            function (result) {
              return pong.getDuelGif().then(function (url) {
                res.json({ text: result.message + ' ' + url });
              });
            },
            function (err) {
              return res.json({ text: err.toString() });
            }
          );
        },
        function (err) {
          res.json({ text: err.message + " Are you registered? Use _pongbot register_ first." });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_SINGLE.test(command)) {
      var params = command.match(COMMANDS.CHALLENGE_SINGLE);
      pong.findPlayer(hook.user_name).then(
        function (player) {
          return pong.createSingleChallenge(hook.user_name, params[3]).then(
            function (result) {
              return pong.getDuelGif().then(function (url) {
                res.json({ text: result.message + ' ' + url });
              });
            },
            function (err) {
              return res.json({ text: err.toString() });
            }
          );
        },
        function (err) {
          res.json({ text: err.message + " Are you registered? Use _pongbot register_ first." });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_ACCEPT.test(command)) {
      pong.acceptChallenge(hook.user_name).then(
        function (result) {
          res.json({ text: result.message });
        },
        function (err) {
          res.json({ text: err.message });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_DECLINE.test(command)) {
      pong.declineChallenge(hook.user_name).then(
        function (result) {
          res.json({ text: result.message });
        },
        function (err) {
          res.json({ text: err.message });
        }
      );
    }

    else if (COMMANDS.CHALLENGE_CHICKEN.test(command)) {
      pong.chickenChallenge(hook.user_name).then(
        function (result) {
          res.json({ text: result.message });
        },
        function (err) {
          res.json({ text: err.message });
        }
      );
    }

    else if (COMMANDS.GAME_LOST.test(command)) {
      pong.lose(hook.user_name).then(
        function (result) {
          res.json({ text: result.message });
        },
        function (err) {
          res.json({ text: err.message });
        }
      );
    }

    else if (COMMANDS.GAME_WON.test(command)) {
      res.json({ text: 'Only the player/team that lost can record the game.' });
    }

    else if (COMMANDS.BOT_RANK.test(command)) {
      var params = command.match(COMMANDS.BOT_RANK);
      pong.findPlayer(params[2] || hook.user_name).then(
        function (player) {
          res.json({ text: player.toString() });
        },
        function (err) {
          res.json({ text: err.message });
        }
      );
    }

    else if (COMMANDS.BOT_LEADERBOARD.test(command)) {
      var params = command.match(COMMANDS.BOT_LEADERBOARD);
      var topN = null;

      if (params[2] && params[2].toLowerCase() === 'infinity') {
        topN = Infinity;
      } else if (params[2] && !isNaN(parseFloat(params[2])) && isFinite(params[2])) {
        topN = +params[2];
      } else {
        topN = 5;
      }

      if (topN <= 0) {
        res.json({ text: "Invalid params, use _pongbot leaderboard <1-Infinity>_." });
      } else {
        Player.find({
          "$or" : [
            { 'wins' : { '$ne' : 0 } },
            { 'losses' : { '$ne' : 0 }
          }]
        })
        .sort({ 'elo' : 'descending', 'wins' : 'descending' })
        .limit(topN)
        .find().then(
          function (players) {
            res.json({ text: Player.toString(players) });
          },
          function (err) {
            res.json({ text: "Error: " + err.message });
          }
        );
      }
    }

    else if (COMMANDS.BOT_RESET.test(command)) {
      var params = command.match(COMMANDS.BOT_RESET);
      if (!process.env.ADMIN_SECRET) {
        res.json({ text: 'Error: ADMIN_SECRET not set.' });
      } else if (process.env.ADMIN_SECRET !== params[2]) {
        res.json({ text: "Invalid secret. Use _pongbot reset <username> <secret>_." });
      } else {
        pong.reset(params[1]).then(
          function (result) {
            res.json({ text: params[1] + "'s stats have been reset." });
          },
          function (err) {
            res.json({ text: err.message });
          }
        );
      }
    }

    else if (COMMANDS.BOT_NEW_SEASON.test(command)) {
      var params = command.match(COMMANDS.BOT_NEW_SEASON);
      if (!process.env.ADMIN_SECRET) {
        res.json({ text: 'Error: ADMIN_SECRET not set.' });
      } else if (process.env.ADMIN_SECRET !== params[1]) {
        res.json({ text: "Invalid secret. Use _pongbot new_season <secret>_." });
      } else {
        pong.resetAll().then(
          function (result) {
            res.json({ text: 'Welcome to the new season!' });
          },
          function (err) {
            res.json({ text: err.message });
          }
        );
      }
    }

    else if (COMMANDS.BOT_SOURCE.test(command)) {
      res.json({ text: 'https://github.com/andrewvy/slack-pongbot' });
    }

    else if (COMMANDS.BOT_HELP.test(command)) {
      res.json({ text: 'https://github.com/andrewvy/slack-pongbot' });
    }

    else if (COMMANDS.BOT_HUG.test(command)) {
      res.json({ text: 'No.' });
    }

    else if (COMMANDS.BOT_SUCKS.test(command)) {
      res.json({ text: 'No, you suck.' });
    }
    else {
      res.json({ text: "I couldn't understand that command. Use _pongbot help_ to get a list of available commands." });
    }
  }
};
