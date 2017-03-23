var mongoose = require('libs/mongoose');
mongoose.set('debug', true); //-> debug mode switcher
var async = require('async');

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

function requireModels(callback) { //-> подключение моделей в отдельной функции
  require('models/user'); // model --> becomes available in mongoose.models (подключение моделей)

  async.each(Object.keys(mongoose.models), function(modelName, callback) {
    mongoose.models[modelName].ensureIndexes(callback);
  }, callback);
}

function createUsers(callback) {
  var users = [
    {username: 'Vasia', password: 'gdfgfdgd'},
    {username: 'Vasia', password: 'fgdfgdjh'},
    {username: 'Admin3', password: 'jkhjkghs'}
  ];

  async.each(users, function(userData, callback) {
    var user = new mongoose.models.User(userData);
    user.save(callback); //async.each take out user and affected arguments from save method
  }, callback);

}

// -> this method execute methods in array strictly one by one
async.series([
  open, dropDB, requireModels, createUsers
], function(err, results) {
  console.log(arguments);
  mongoose.disconnect();
  process.exit(err ? 255 : 0); //if error exit code is 255, otherwise exit code is normal = 0
});

