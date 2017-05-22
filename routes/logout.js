var express = require('express');
var router = express.Router();
var dbmodules = require('../util/dbmodule.js');
var sessioning = require('../util/sessioning');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;

router.use(function(req, res, next){
  errCtl(res, next, !sessioning.getSession(req), '/', '');
});
router.use(sessioning.doLogout);

module.exports = router;
