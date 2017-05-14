var async = require('async');
var HttpError = require('error').HttpError;
var util = require('util');
var crypto = require('crypto');
var mongoose = require('libs/mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true, // username, background:true --> mongo сама создает в фоне еще свой идентификатор если unique: true
    required: true
  },
  hashedPassword: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});
// console.log('schema', schema);
schema.methods.encryptPassword = function(password) {
  // console.log('this.salt', this.salt);
  return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
};

schema.virtual('password') // виртуальное поле
  .set(function(password) {
    this._plainPassword = password;
    this.salt = Math.random() + ''; // will be saved in DB
    this.hashedPassword = this.encryptPassword(password); // will be saved in DB
  })
  .get(function() {
    return this._plainPassword;
  });
// console.log(schema.hashedPassword);
// schema.virtual('password').set('123');
// console.log(schema.virtual('password').get());
schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

schema.statics.authorize = function(username, password, callback) {
  var User = this;
  //code below is based on async library (method waterfall)
  async.waterfall([
      function(callback) {
        User.findOne({username: username}, callback);
      },
      function(user, callback) {
        if(user) {
          if(user.checkPassword(password)) {
            callback(null, user);
          } else {
            callback(new AuthError('Incorrect password!'))
          }
        } else {
          // if there are no such user -- need to create it
          var user = new User({username: username, password: password});
          user.save(function(err) {
            if(err) {return callback(err)}
            callback(null, user);
          })
        }
      }
    ],
    callback
  );

  //code below is the same but based on callbacks
  /*  User.findOne({username: username}, function(err, user) {
   if(err) {return next(err)}
   if(user) {
   if(user.checkPassword(password)) {
   //...200 OK
   } else {
   //...403 Forbidden
   }
   } else {
   var user = new User({username: username, password: password});
   user.save(function(err) {
   if(err) {return next(err)}
   //...200 OK
   })
   }
   });*/
};

exports.User = mongoose.model('User', schema);

function AuthError(message) {
  Error.apply(this, arguments);
  Error.captureStackTrace(this, HttpError);

  this.message = message;
}

util.inherits(AuthError, Error);
AuthError.prototype.name = 'AuthError';
exports.AuthError = AuthError;