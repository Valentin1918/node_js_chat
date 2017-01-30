var nconf = require('nconf');
var path = require('path');

var config = nconf.argv()
  .env()
  .file({file: path.join(__dirname, 'config.json')});

module.exports = config;