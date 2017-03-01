var mongoose = require('libs/mongoose');
var async = require('async');
var User = require('models/user').User;

// 1. drop database
// 2. create & save 3 users
// 3. close connection

mongoose.connection.on('open', function() {
  var db = mongoose.connection.db;

  console.log(mongoose.connection.readyState);

  db.dropDatabase(function(err) {
    if(err) throw err;

    console.log('OK');
    var vasia = new User({username: 'Vasia', password: 'gdfgfdgd'});
    var petia = new User({username: 'Petia', password: 'fgdfgdjh'});
    var admin = new User({username: 'Admin', password: 'jkhjkghs'});
    var users = [vasia, petia, admin];

    var usersMap = users.map(function(user) {
      return function(callback) {
        user.save(function(err) {
          callback(err, user); // -> if there is no err, user is saved in DB
        })
      }
    });
/**
instead of:
    user.save(function(err) {
      callback(err, user);
    });
 we can use:
    user.save(callback);
 but because of save method structure:
    save(function(err, user, affected));
 we will receive an array of arrays [user, affected] instead of an array of objects user
*/

    async.parallel(usersMap,
      // optional callback
      function(err, results) {
        console.log(arguments);
        mongoose.disconnect();
      });

  });
});

