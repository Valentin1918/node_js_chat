var express = require('express');
var path = require('path');
var http = require('http');
var config = require('config');

var errorhandler = require('errorhandler');
var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.set('port', config.get('port'));

var server = http.createServer(app);


server.listen(config.get('port'), function(){
  console.log('Express server listening on port: ', config.get('port'));
});
// server.on('error', onError);
// server.on('listening', onListening);


app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public'))); //we set that current url /public is our static folder

app.use('/', index);
app.use('/users', users);

// Middleware
app.use(function(req, res, next) {
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
app.use(function(req, res, next) {
  res.status(404).send('Page not found');
});


// Handle errors -- has 4 arguments. If in some middleware was thrown an error or passed an Error in nex -- we come in handle error
app.use(function(err, req, res, next) {
  console.log(req.app.get('env'));
  if(app.get('env') === 'development') {
    var errorHandler = errorhandler();
    errorHandler(err, req, res, next)
  } else {
    res.status(500);
  }
});

module.exports = app;
