/** Made on Mongoose*/

var mongoose = require('mongoose');
mongoose.Promise = require('bluebird'); // because mpromise (mongoose's default promise library) is deprecated
mongoose.connect('mongodb://localhost/test');

var schema = mongoose.Schema({
  name: String
});
schema.methods.meow = function() {
  console.log(this.get('name'), 'say meow...');
};
// declaring our class (className, allowed fields with types); best way is to to indicate allowed fields in schema!
var Cat = mongoose.model('Cat', schema);

var kitty = new Cat({
  name: 'Zildjian',
  lastName: 'MR cat' //--> this field will be ignored because it was not listed during a class declaration

});
// write an object "kitty" (with allowed fields) in collection cats (plural from "Cat")
kitty.save(function (err, kitty, affected) { //affected - number of changed objects
  if (err) {
    console.log(err);
  } else {
    // in kitty object: _id -- generated automatic; __v -- need for versioning
    kitty.meow();
  }
});
