var crypto = require('crypto');
var mongoose = require('libs/mongoose');
var Schema = mongoose.Schema;

var schema = new Schema({
  username: {
    type: String,
    unique: true,
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
    required: Date.now
  }
});

schema.methods.encryptPassword = function(password) {
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

schema.methods.checkPassword = function(password) {
  return this.encryptPassword(password) === this.hashedPassword;
};

exports.User = mongoose.model('User', schema);