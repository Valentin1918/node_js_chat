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

exports.User = mongoose.model('User', schema);