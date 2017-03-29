var winston = require('winston');
var ENV = process.env.NODE_ENV; //process.env = user environment

function getLogger(module) {
  var path = module.filename.split('/').slice(-2).join('/'); //cut last part of url => node_js_chat/app.js
  return new winston.Logger({
    transports: [
      new winston.transports.Console({
        colorize: true, //make 'info' green color
        level: ENV === 'development' ? 'debug' : 'error',
        label: path //indicate in [] last two steps of current script
      })
    ]
  });
}

module.exports = getLogger;