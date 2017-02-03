var express = require('express');
var path = require('path');
var http = require('http');

var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var config = require('config');
var errorhandler = require('errorhandler');
var log = require('libs/log')(module); //require and run logger by passing module as an argument

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.set('port', config.get('port'));

var server = http.createServer(app);


server.listen(config.get('port'), function(){
  log.info('Express server listening on port: ', config.get('port')); //old => log.log('info', 'check log.log');
  log.debug('we check this debug'); //old => log.log('debug', 'check log.debug');
});
// server.on('error', onError);
// server.on('listening', onListening);

app.engine('ejs', require('ejs-locals')); //layout partial block -- файлы с расширением ejs обрабатывать при помощи ejs-locals
app.set('views', path.join(__dirname, 'views')); //our templates (html pages) - шаблонизатор
app.set('view engine', 'ejs'); // движок для шаблонов - ejs


//External middlewares:
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // uncomment after placing your favicon in /public
app.use(logger('dev')); // log each http request in console . In connect - logger we can see other formats (now we have dev); wo flag immediate log is written ONLY by http request finishing.
app.use(bodyParser.json()); // bodyParser разбирает тело запроса (form, json...) из req.body...
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // cookieParser разбирает куки из req.headers и делает req.cookies
//app.use(app.router); // for using routers app.get('/', ...), app.post('/', ...), app.put('/', ...) ...  --> is already deprecated on express 4.0

app.use(express.static(path.join(__dirname, 'public'))); //we set that current url /public is our static folder -- отдает статику


app.get('/', function(req, res, next) {
  res.end('Test')
});

app.get('/hello', function(req, res, next) {
  res.render('hello', {
    body: '<b>Hello</b>'
  });
});


// app.use('/', index);
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
