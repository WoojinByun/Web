var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;

router.use(function(req, res, next){
  params = sessioning.getSession(req);
  errCtl(res, next, params.user, '/', '이미 로그인이 되어있습니다. 메인 페이지로 이동합니다.');
});
router.post('/', sessioning.doLogin);
router.get('/', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

module.exports = router;
