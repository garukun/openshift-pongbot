//  _____             _____     _
// |  _  |___ ___ ___| __  |___| |
// |   __| . |   | . | __ -| . |  _|
// |__|  |___|_|_|_  |_____|___|_|
//               |___|

'use strict';

var mongoose = require('mongoose');
var mongoUri = 'mongodb://' + process.env.OPENSHIFT_MONGODB_DB_USERNAME
    + ':' + process.env.OPENSHIFT_MONGODB_DB_PASSWORD + '@'
    + process.env.OPENSHIFT_MONGODB_DB_HOST  + ':'
    + process.env.OPENSHIFT_MONGODB_DB_PORT;
mongoose.connect(mongoUri);

var app = require('./lib/app').instance();

var ip = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000;
app.listen(port, function() {
  console.log('Listening on port', port);  
});
