var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule.js');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;
var params;

router.use(function(req, res, next){
  params = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});
router.get('/', function(req, res, next) {
  var scheduleEvt = dbmodule.getSchedule(params.user.usrNum);
  scheduleEvt.on('end', function(error, schedules){
    if (error) {
      res.writeHead(500);
      res.end();
    }
    params.schedules = schedules;
    display(req, res);
	});
});

function display(req, res){
  console.log("params.user : ", params.user);
  console.log("params.courses : ", params.courses);
  console.log("params.schedules : ", params.schedules);
  if(!params.schedules){
    return;
  }
  res.render('schedule', { title: 'Schedule', params: params});
}

module.exports = router;
