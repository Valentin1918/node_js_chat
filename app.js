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
var mongoose = require('libs/mongoose');
mongoose.Promise = global.Promise; //mongoose promise library is deprecated (we use global.Promise instead)
var session = require('express-session');
var HttpError = require('error').HttpError;

var index = require('routes');

var app = express();
app.set('port', config.get('port'));

var server = http.createServer(app);


server.listen(config.get('port'), function(){
  log.info('Express server listening on port: ', config.get('port')); //old => log.log('info', 'check log.log');
  log.debug('we check this debug'); //old => log.log('debug', 'check log.debug');
});
// server.on('error', onError);
// server.on('listening', onListening);

/*-------------------------------------------------WS-----------------------------------------------------------------*/
require('./socket')(server);
/*-------------------------------------------------WS-end-------------------------------------------------------------*/

app.engine('ejs', require('ejs-locals')); //layout partial block -- файлы с расширением ejs обрабатывать при помощи ejs-locals
app.set('views', path.join(__dirname, 'views')); //our templates (html pages) - шаблонизатор
app.set('view engine', 'ejs'); // движок для шаблонов - ejs


//External middlewares:
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico'))); // uncomment after placing your favicon in /public
app.use(logger('dev')); // log each http request in console . In connect - logger we can see other formats (now we have dev); wo flag immediate log is written ONLY by http request finishing.
app.use(bodyParser.json()); // bodyParser разбирает тело запроса (form, json...) из req.body...
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser()); // cookieParser разбирает куки из req.headers и делает req.cookies

var sessionStore = require('libs/sessionStore');
// в начале куки s%3A -- говорит о том что кука подписанна (имеет secret)
// в консоли document.cookie -- выдасть пустую строку так как у нас в cookie.httpOnly = true

app.use(session({ //need to use after cookie parser use
  secret: config.get('session:secret'), //some secret for our cookie -- на основе его генериться криптованная подпись (не передаеться юзеру -- создаеться чтоб подписывать куки)
  key: config.get('session:key'), //some key for our cookie
  cookie: config.get('session:cookie'), //"httpOnly": true -- means that cookie doesn't enter in JS (protection of XSS attacks) -- not accessible by document.cookie, "maxAge": null -- cookie live during the session
  store: sessionStore, //хранилище данных и сессии
  resave: false,
  saveUninitialized: true
  // согласно доки connect-mongo если сессия никак не менялась 2 недели она будет удалена с БД (можно конфигурировать меняя maxAge)
})); //initially set cookie connect:sid

// app.use(function(req, res, next) {
//   req.session.numberOfVisits = req.session.numberOfVisits + 1 || 1; //we can put in req.session any needed data -- объект данных о сессии
//   res.send('Visits: ' + req.session.numberOfVisits);
// });

//app.use(app.router); // for using routers app.get('/', ...), app.post('/', ...), app.put('/', ...) ...  --> is already deprecated on express 4.0
app.use(express.static(path.join(__dirname, 'public'))); //we set that current url /public is our static folder -- отдает статику

app.use(require('middleware/sendHttpError'));
app.use(require('middleware/loadUser')); //need to be inserted after session and before routes
index(app);


// app.use('/', index);

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
  // console.log('res-----', res.sendHttpError);
  if(typeof err === 'number') { //-> next(404) for example
    console.log('typeof err === number');
    err = new HttpError(err);
  }

  if(err instanceof HttpError) {
    console.log('we send sendHttpError');
    res.sendHttpError(err); //-> our custom method
  } else {
    if(app.get('env') === 'development') {
      var errorHandler = errorhandler();
      errorHandler(err, req, res, next); //-> run error handler (before it was built in express)
    } else {
      log.error(err); //-> if production we need to write an error in log
      err = new HttpError(500);
      res.sendHttpError(err);
    }
  }
});

module.exports = app;

// test change
//TODO: lesson 13 , 13:48