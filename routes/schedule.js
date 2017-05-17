var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule.js');
var params = {};

router.use(function(req, res, next){
  params.user = sessioning.getSession(req);
  if(params.user)
    next();
  else
    res.redirect('/login');
});
router.get('/', function(req, res, next) {
  var courseEvt = dbmodule.getCourse(params.user.usr_num);
  courseEvt.on('end', function(error, courses){
    if (error) {
      res.writeHead(500);
      res.end();
    }
    params.courses = courses;
    display(req, res);
  });

  var scheduleEvt = dbmodule.getSchedule(params.user.usr_num);
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
  if(!(params.courses && params.schedules)){
    return;
  }
  res.render('schedule', { title: 'Schedule', params: params});
}

module.exports = router;
