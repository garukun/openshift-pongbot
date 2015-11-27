var Q = require('q');

var Player = require('../../models/Player');
var Challenge = require('../../models/Challenge');
var pong = require('../pong');

var RandomChallengeCommand = {
  command: /^(vs|challenge)\s+random$/i,
  run: function randomChallengeRun(params, hook, res) {
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
};

var SinglesChallengeCommand = {
  command: /^(vs|challenge)\s+(singles?\s+)?(.*)$/i,
  run: function singlesChallengeRun(params, hook, res) {
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
}

var DoublesChallengeCommand = {
  command: /^(vs|challenge)\s+(doubles?\s+)?(.*)\s+(against|vs)\s+(.*)\s+(.*)$/i,
  run: function doublesChallengeRun(params, hook, res) {
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
}

module.exports = {
  commands: [
    DoublesChallengeCommand,
    RandomChallengeCommand,
    SinglesChallengeCommand
  ]
}
