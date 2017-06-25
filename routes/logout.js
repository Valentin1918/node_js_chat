var eventEmitter = require('./../eventEmitter');

exports.post = function(req, res, next) {
  var sid = req.session.id;
  // var io = req.app.get('io'); // take global for an application variable (made using:   app.set('io', io);   in app.js)
  req.session.destroy(function(err) {
    // io.sockets.$emit('session:reload', sid); // generate server event (like eventEmitter) --> $emit is deprecated, so need to use eventEmitter
    eventEmitter.emit('session:reload', sid);
    if(err) { return next(err); }
    res.redirect('/');
  });
};