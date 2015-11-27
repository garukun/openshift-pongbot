var Q = require('q');

var Player = require('../../models/Player');
var Challenge = require('../../models/Challenge');
var pong = require('../pong');

var RegisterCommand = {
  command: /^register$/,
  run: function registerCommandRun(params, hook, res) {
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
};

var RankCommand = {
  command: /^rank(\s+(.*))?$/i,
  run: function rankCommandRun(params, hook, res) {
    pong.findPlayer(params[2] || hook.user_name).then(
      function (player) {
        res.json({ text: player.toString() });
      },
      function (err) {
        res.json({ text: err.message });
      }
    );
  }
};

var LeaderboardCommand = {
  command: /^leaderboard(\s+(.*))?$/i,
  run: function leaderboardCommandRun(params, hook, res) {
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
};

var ResetCommand = {
  command: /^reset\s+(.*)\s+(.*)$/i,
  run: function resetCommandRun(params, hook, res) {
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
};


var NewSeasonCommand = {
  command: /^new_season\s+(.*)$/i,
  run: function newSeasonComandRUn(params, hook, res) {
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
};

var HelpCommand = {
  command: /^help$/i,
  run: function helpCommandRun(params, hook, res) {
    res.json({ text: 'https://github.com/andrewvy/slack-pongbot' });
  }
};

var SourceCommand = {
  command: /^source$/i,
  run: function sourceCommandRun(params, hook, res) {
    res.json({ text: 'https://github.com/andrewvy/slack-pongbot' });
  }
};

var HugCommand = {
  command: /^hug$/i,
  run: function hugCommandRun(params, hook, res) {
    res.json({ text: 'No.' });
  }
};

var SucksCommand = {
  command: /^sucks$/i,
  run: function sucksCommandRun(params, hook, res) {
    res.json({ text: 'No, you suck.' });
  }
};

module.exports = {
  commands: [
    RegisterCommand,
    RankCommand,
    LeaderboardCommand,
    NewSeasonCommand,

    HelpCommand,
    SucksCommand,
    HugCommand,

    ResetCommand,
    SourceCommand
  ]
}
