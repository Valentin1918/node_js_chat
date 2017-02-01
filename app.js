var express = require('express');
var path = require('path');
var http = require('http');
var config = require('config');
var errorhandler = require('errorhandler');
var log = require('libs/log')(module); //require and run logger by passing module as an argument

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.set('port', config.get('port'));

var server = http.createServer(app);


server.listen(app.get('port'), function(){
  log.info('Express server listening on port: ', config.get('port')); //old => log.log('info', 'check log.log');
  log.debug('we check this debug'); //old => log.log('debug', 'check log.debug');
});
// server.on('error', onError);
// server.on('listening', onListening);


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public'))); //we set that current url /public is our static folder

app.use('/', index);
app.use('/users', users);

// Middleware --> with 3 arguments
app.use(function(req, res, next) {
  // console.log(process.env);
  if(req.url === '/test') {
    res.end('Test')
  } else {
    next();
  }
});

app.use(function(req, res, next) {
  if(req.url === '/forbidden') {
    next(new Error('access denied'))
  } else {
    next();
  }
});

// Handle nonexistent pages --> otherwise will run built in method, which will show: Cannot GET /...
// catch 404 and forward to error handler --> otherwise will run built in method, which will show: Cannot GET /...
app.use(function(req, res) {
  res.status(404).send('Page not found');
});


// Handle errors -- has 4 arguments. If in some middleware was thrown an error or passed an Error in nex -- we come in handle error
app.use(function(err, req, res, next) {
  if(app.get('env') === 'development') {
    var errorHandler = errorhandler();
    errorHandler(err, req, res, next)
  } else {
    res.status(500);
  }
});

module.exports = app;
