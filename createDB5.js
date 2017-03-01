var mongoose = require('libs/mongoose');
mongoose.set('debug', true);
var async = require('async');
var User = require('models/user').User;

// 1. drop database
// 2. create & save 3 users
// 3. close connection

function open(callback) {
  mongoose.connection.on('open', callback)
}

function dropDB(callback) {
  var db = mongoose.connection.db;
  db.dropDatabase(callback);
}

function createUsers(callback) {
  var users = [
    {username: 'Vasia2', password: 'gdfgfdgd'},
    {username: 'Petia2', password: 'fgdfgdjh'},
    {username: 'Admin2', password: 'jkhjkghs'}
  ];

  async.each(users, function(userData, callback) {
    var user = new User(userData);
    user.save(callback); //async.each take out affected from save method
  }, callback);

}

function close(callback) {
  mongoose.disconnect(callback);
}

// -> this method execute methods in array strictly one by one
async.series([
  open, dropDB, createUsers, close
], function(err, results) {
  console.log(arguments);
});

