module.exports = function(req, res, next) {

  res.sendHttpError = function(error) {
    console.log('sendHttpError', error.status);
    res.status(error.status);
    if(res.req.headers['x-requested-with'] === 'XMLHttpRequest') {
      console.log(1);
      res.json(error);
    } else {
      console.log(2);
      res.render('error', {error: error});
    }
  };

  next();

};