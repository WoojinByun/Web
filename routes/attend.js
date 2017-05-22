var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule.js');
var errorControl = require('../util/errorControl.js');
var errCtl = errorControl.errCtl
var params;
var courseNum;

router.use(function(req, res, next){
  params = {}
  params.user = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});
router.use('/:courseNum', function (req, res, next) {
  courseNum = req.params.courseNum;
  errCtl(res, next, courseNum != (''+parseInt(courseNum)), '/', '유효하지 않은 주소입니다.');
});
router.get('/:courseNum', function(req, res, next) {
  var courseEvt = dbmodule.getCourse(params.user.usrNum);
  courseEvt.on('end', function(error, courses){
    if (error) {
      res.writeHead(500);
      res.end();
    }
    params.courses = courses;
    display(req, res);
  });

  var attendEvt = dbmodule.getStuAttend(params.user.usrNum, courseNum);
  attendEvt.on('end', function(error, attends){
    if (error) {
      res.writeHead(500);
      res.end();
    }
    params.attends = attends;
    display(req, res);
	});
});

function display(req, res){
  console.log("params.user : ", params.user);
  console.log("params.courses : ", params.courses);
  console.log("params.attends : ", params.attends);
  if(!(params.courses && params.attends)){
    return;
  }
  res.render('attend', { title: 'Attend', params: params});
}

module.exports = router;
