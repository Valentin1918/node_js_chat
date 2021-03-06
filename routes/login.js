var User = require('models/user').User;
var HttpError = require('error').HttpError;
var AuthError = require('models/user').AuthError;


exports.get = function(req, res) {
  res.render('login');
};

exports.post = function(req, res, next) {
  //req.body --> свойство которое содержит в себе передаваемые с клиента данные (это делает мидлвара bodyParser)
  var username = req.body.username;
  var password = req.body.password;

  // 1) Получить посетителя с таким username из базы
  // 2) Такой посетитель найден?
  //   да - сверить пароль вызовом user.checkPassword
  //   нет - создать нового юзера
  // 3) Авторизация успешна?
  //  да - сохранить _id посетителя в сессии: session = user._id и ответить 200
  //  нет - вывести ошибку (403 или другую)

  User.authorize(username, password, function(err, user) {
    if(err) {
      if(err instanceof AuthError) {
        return next(new HttpError(403, err.message));
      } else {
        return next(err);
      }
    }

    req.session.user = user._id;
    res.send({});  // or --> res.end();
  });

};