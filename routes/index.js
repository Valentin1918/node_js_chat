var User = require('models/user').User;
var HttpError = require('error').HttpError;
var ObjectID = require('mongodb').ObjectID;

module.exports = function(app) {
  app.get('/', function(req, res, next) {
    res.end('Test');
  });

  app.get('/hello', function(req, res, next) {
    res.render('hello', {
      // body: '<b>Hello</b>' //--> don't need it here because of template
    });
  });

  app.get('/users', function(req, res, next) {
    User.find({}, function(err, users) {
      if(err) {return next(err)}
      res.json(users);
    })
  });

  app.get('/user/:id', function(req, res, next) { //-> ':id' write a value in req.params.id
    try {
      var id = new ObjectID(req.params.id);
    } catch(e) {
      console.log('catch');
      next(404);
      return;
    }

    User.findById(id, function(err, user) {
      // console.log('findById------->', err, user);
      if(err) {console.log('----------error');return next(err)}
      if(!user) {
        console.log('!user------->');
        next(new HttpError(404, 'User not found.'))
      } else {
        res.json(user); //-> putted in else because it throw an error and stop node process if the id is valid and !user
      }
    });
  });
};
