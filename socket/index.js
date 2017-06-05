// npm debug is built-in socket.io so don't need even to install debug or plug in it.
// only one think is needed on server side: DEBUG=* on environment variables
// on client side: localStorage.debug = '*'; in browser console

module.exports = function(server) {
  var io = require('socket.io')(server); //plugged in a library for ws socket.io

  io.origins(['localhost:*']); // allow connect to out webservice only sites from the same domain
  //io.set('origins', 'localhost:*'); //io.set is deprecated
  //io.set('logger', log); //io.set is deprecated

  io.on('connection', function(client){ //client --> объект связанный с клиентом -- отдаем и получаем сообщения клиенту
    client.on('message', function(text, cb){
      client.broadcast.emit('message', text); // broadcast send message to all connections except this one who emit it
      cb('123'); // call callback from client side
    });
  });
};