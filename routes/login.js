var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');

router.use(function(req, res, next){
  if(sessioning.getSession(req))
    res.redirect('/');
  else
    next();
});
router.post('/', sessioning.doLogin);
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

module.exports = router;
