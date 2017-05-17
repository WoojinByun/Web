var express = require('express');
var router = express.Router();
var dbmodules = require('../util/dbmodule.js');
var sessioning = require('../util/sessioning');

router.use(function(req, res, next){
  if(sessioning.getSession(req))
    next();
  else
    res.redirect('/');
});
router.use(sessioning.doLogout);

module.exports = router;
