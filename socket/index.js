var async = require('async');
var cookie = require('cookie');
var config = require('config');
var connect = require('connect');
var sessionStore = require('lib/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;
// npm debug is built-in socket.io so don't need even to install debug or plug in it.
// only one think is needed on server side: DEBUG=* on environment variables
// on client side: localStorage.debug = '*'; in browser console

function loadSession(sid, callback) {
  //sessionStore callback is not quite async-style!
  sessionStore.load(sid, function(err, session) {
    if(arguments.length === 0) {
      //no arguments -> no session
      return callback(null, null);
    } else {
      return callback(null, session);
    }
  });
}

function loadUser(session, callback) {
  if(!session.user) {
    return callback(null, null);
  }

  User.findById(session.user, function(err, user) {
    if(err) {return callback(err)}
    if(!user) {return callback(null, null)}
    callback(null, user);
  })
}

module.exports = function(server) {
  var io = require('socket.io')(server); //plugged in a library for ws socket.io

  io.origins(['localhost:*']); // allow connect to out webservice only sites from the same domain
  //io.set('origins', 'localhost:*'); //io.set is deprecated
  //io.set('logger', log); //io.set is deprecated

  io.use(function(socket, next) {
    var handshake = socket.request;
    // make sure the handshake data looks good as before
    // if error do this:
    // next(new Error('not authorized'));
    // else just call next

    async.waterfall([
        function(callback) {
          handshake.cookies = cookie.parse(handshake.headers.cookie || '');
          var sidCookie = handshake.cookies[config.get('session:key')];
          var sid = connect.utils.parseSignedCookie(sidCookie, config.get('session:secret')); //connect.utils.parseSignedCookie - take out express signature from cookie
          loadSession(sid, callback);
        },
        function(session, callback) {
          if(!session) {
            callback(new HttpError(401, 'No session'));
          }

          handshake.session = session;
          loadUser(session, callback);
        },
      function(user, callback) {

      }
      ],
      callback
    );



    next();
  });


  io.on('connection', function(client){ //client --> объект связанный с клиентом -- отдаем и получаем сообщения клиенту
    //HTTP(S)
    //browser --> login password --> server
    //browser <-- sid(cookie) <-- server
    //browser --sid--> server (socket IO отдает на сервер sid(cookie) в хедере, в ответ получает ключь для вебсокета WSKEY)

    //HTTP(S)
    //browser --sid--> WSKEY --> server (socket IO делает еще один запрос передавая и sid в хедере и в queryString и WSKEY c ключем sid)

    //WS(S) (после этого открываеться WS соединение)
    //WSKEY
    //sid(cookie) для передачи socket IO на сервер берется из объекта socket.handshake (тут на сервере socket я назвал client)
    console.log(client.handshake);

    client.on('message', function(text, cb){
      client.broadcast.emit('message', text); // broadcast send message to all connections except this one who emit it
      cb('123'); // call callback from client side
    });
  });
};