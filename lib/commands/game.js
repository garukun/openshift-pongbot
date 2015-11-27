var Q = require('q');

var Player = require('../../models/Player');
var Challenge = require('../../models/Challenge');
var pong = require('../pong');

var GameAcceptCommand = {
  command: /^(ok|accept)$/i,
  run: function gameAcceptRun(params, hook, res) {
    pong.acceptChallenge(hook.user_name).then(
      function (result) {
        res.json({ text: result.message });
      },
      function (err) {
        res.json({ text: err.message });
      }
    );
  }
};

var GameDeclineCommand = {
  command: /^(no|decline)$/i,
  run: function gameDeclineRun(params, hook, res) {
    pong.declineChallenge(hook.user_name).then(
      function (result) {
        res.json({ text: result.message });
      },
      function (err) {
        res.json({ text: err.message });
      }
    );
  }
};

var GameChickenCommand = {
  command: /^chicken$/i,
  run: function gameChickenRun(params, hook, res) {
    pong.chickenChallenge(hook.user_name).then(
      function (result) {
        res.json({ text: result.message });
      },
      function (err) {
        res.json({ text: err.message });
      }
    );
  }
};

var GameLostCommand = {
  command: /^lost$/i,
  run: function gameLostRun(params, hook, res) {
    pong.lose(hook.user_name).then(
      function (result) {
        res.json({ text: result.message });
      },
      function (err) {
        res.json({ text: err.message });
      }
    );
  }
};

var GameWonCommand = {
  command: /^won$/i,
  run: function gameWonRun(params, hook, res) {
    res.json({ text: 'Only the player/team that lost can record the game.' });
  }
};

module.exports = {
  commands: [
    GameAcceptCommand,
    GameDeclineCommand,
    GameChickenCommand,

    GameLostCommand,
    GameWonCommand
  ]
}
