var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;
var user = {};
var params = {};

router.use(function(req, res, next){
  params = {}
  params.user = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});
router.get('/', function(req, res, next) {
  var courseEvt = dbmodule.getCourse(params.user.usrNum);
  courseEvt.on('end', function(error, courses){
    if (error) {
      res.writeHead(500);
      res.end();
    }
    params.courses = courses;
    display(req, res);
  });
});

function display(req, res){
  console.log("user : ", params.user);
  console.log("courses : ", params.courses);
  if(!(params.courses)){
    return;
  }
  res.render('index', { title: 'Main', params: params});
}
module.exports = router;
