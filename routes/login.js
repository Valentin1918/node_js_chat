var User = require('models/user').User;
var HttpError = require('error').HttpError;
var async = require('async');

exports.get = function(req, res) {
  res.render('login');
};

exports.post = function(req, res, next) {
  //req.body --> свойство которое содержит в себе пердаваемые с клиента данные (это делает мидлвара bodyParser)
  var username = req.body.username;
  var password = req.body.password;

  // 1) Получить посетителя с таким username из базы
  // 2) Такой посетитель найден?
  //   да - сверить пароль вызовом user.checkPassword
  //   нет - создать нового юзера
  // 3) Авторизация успешна?
  //  да - сохранить _id посетителя в сессии: session = user._id и ответить 200
  //  нет - вывести ошибку (403 или другую)

  //code below is based on async library (method waterfall)
  async.waterfall([
    function() {
      User.findOne({username: username}, callback);
    },
    function(user, callback) {
      if(user) {
        if(user.checkPassword(password)) {
          callback(null, user);
        } else {
          next(new HttpError(403, 'Incorrect password!'))
        }
      } else {
        var user = new User({username: username, password: password});
        user.save(function(err) {
          if(err) {return next(err)}
          callback(null, user);
        })
      }
    },
    function(err, user) {
      if(err) {return next(err)}
      req.session.user = user._id;
      res.send({}); // or --> res.end();
    }
  ]);
//TODO: lesson 9 , 8:10
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