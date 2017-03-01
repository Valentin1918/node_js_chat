var User = require('models/user').User;

var user = new User({
  username: 'Tester3',
  password: 'secret'
});
console.log('user.hashedPassword', user.hashedPassword);
console.log('user._plainPassword', user._plainPassword);
console.log('user.salt', user.salt);
console.log('user.created', user.created);
user.save(function(err, user, affected) {
  if(err) throw err;

  User.findOne({username: 'Tester'}, function(err, tester) {
    console.log(tester);
  });
});