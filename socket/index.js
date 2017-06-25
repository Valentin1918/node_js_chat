var async = require('async');
var cookie = require('cookie');
var config = require('config');
var cookieParser = require('cookie-parser');
var sessionStore = require('libs/sessionStore');
var HttpError = require('error').HttpError;
var User = require('models/user').User;
// npm debug is built-in socket.io so don't need even to install debug or plug in it.
// only one think is needed on server side: DEBUG=* on environment variables
// on client side: localStorage.debug = '*'; in browser console

function loadSession(sid, callback) {
  console.log('run loadSession');
  //sessionStore callback is not quite async-style!
  sessionStore.load(sid, function(err, session) {
    console.log('inside');
    if(arguments.length === 0) {
      console.log('callback was run 1');
      //no arguments -> no session
      return callback(null, null);
    } else {
      console.log('callback was run 2', callback);
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
  var eventEmitter = require('./../eventEmitter');

  io.origins(['192.168.1.103:*']); // allow connect to out webservice only sites from the same domain
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
        //console.log('handshake.cookies', handshake.cookies);

        var sidCookie = handshake.cookies[config.get('session:key')];
        //console.log('sidCookie', sidCookie);
        var sid = cookieParser.signedCookie(sidCookie, config.get('session:secret')); // - take out express signature from cookie
        // console.log('sid', sid);

        loadSession(sid, callback);
      },
      function(session, callback) {
      // console.log('session', session);
        if(!session) {
          callback(new HttpError(401, 'No session'));
        }

        handshake.session = session;
        loadUser(session, callback);
      },
      function(user, callback) {
        // console.log('user', user);
        if(!user) {
          callback(new HttpError(403, 'Anonymous session may not be connect!'));
        }
        handshake.user = user;
        callback(null);
      }
      ],
      function(err) {
        if(!err) {
          return next(null, true);
        }
        if(err instanceof HttpError) {
          return next(null, false);
        }
        next(err);
      }
    );
    next(handshake); //pass changed handshake forward
  });


  eventEmitter.on('session:reload', function(sid){
    // find socket with client.handshake.session.id == sid
    // reload session
    // var clients = io.sockets.clients(); // get all socket clients (all available sockets) --> deprecated
    var clients = io.sockets.sockets;
    var clientsKeys = Object.keys(clients); //(all available sockets keys)
    console.log('clientsKeys', clientsKeys);
    clientsKeys.forEach(function(clientKey) {
      var client = clients[clientKey];
      var handshakeCookies = cookie.parse(client.handshake.headers.cookie || '');
      var handshakeCookiesSid = cookieParser.signedCookie(handshakeCookies.sid, config.get('session:secret')); // - take out express signature from cookie

      if(handshakeCookiesSid !== sid) { return }

      loadSession(sid, function(err, session) {
        if(err) {
          client.emit('error', 'server error');
          client.disconnect();
          return;
        }
        if(!session) {
          client.emit('logout');
          client.disconnect();
          return;
        }
        client.handshake.session = session;
      })

    })

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
    // console.log('client.handshake', client.handshake);
    var handshake = client.request;
    // console.log('handshake', handshake.user);
    var username = handshake.user.username;

    client.broadcast.emit('join', username);

    client.on('message', function(text, cb){
      client.broadcast.emit('message', username, text); // broadcast send message to all connections except this one who emit it
      cb && cb(); // call callback from client side
    });

    client.on('disconnect', function() {
      console.log('disconnect');
      client.broadcast.emit('leave', username);
    });

  });

  return io;
};