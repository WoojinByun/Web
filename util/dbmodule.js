var util = require('util');
var fs = require('fs');

var xml_digester = require("xml-digester");
var digester = xml_digester.XmlDigester({});
var mysql = require('mysql');

var dbconfig   = require('../config/database.js');
var db = mysql.createConnection(dbconfig);
var EventEmitter = require('events').EventEmitter;

fs.readFile('./query/query.xml','utf8', function(error, data) {
  if (error) {
    console.log(error);
  } else {
    digester.digest(data, function(error, result) {
      if (error) {
        console.log(error);
      } else {
        global.doLogin_query = result.query.doLogin;
        global.getCourse_query = result.query.getCourse;
        global.getSchedule_query = result.query.getSchedule;
        global.getStuAttend_query = result.query.getStuAttend;
        global.getUsersInfo_query = result.query.getUsersInfo;
      }
    });
  }
});

function doLogin(req, res){
  var id = req.body.id;
  var pw = req.body.pw;
  var query = util.format( global.doLogin_query , id, pw);
  console.log(query);
  db.query(query, function (error, result, field) {
    if (error) {
      res.writeHead(500);
      res.end();
    } else {
      if(result[0] && result[0].usr_num){
        req.session.user = {
          usrNum: result[0].usr_num,
          name: result[0].name
        }
        res.redirect('/');
      }
      else {
        res.render('login', { title: 'Login', state: 'wrong' });
      }
    }
  });
}

function getCourse(usrNum){
  var query = util.format( global.getCourse_query , usrNum);
  var evt = new EventEmitter();
  console.log(query);
  db.query(query, function (error, result, field) {
    var courses = [];
    for(var i=0; result && i<result.length; i++){
      var course = {
        couNum: result[i].cou_num,
        couName: result[i].cou_name,
        proName: result[i].pro_name
      }
      courses.push(course);
    }
    evt.emit('end', error, courses);
  });
  return evt;
}

function getSchedule(usrNum){
  var query = util.format( global.getSchedule_query , usrNum);
  console.log(query);
  var evt = new EventEmitter();
  db.query(query, function (error, result, field) {
    var schedules = [];
    for(var i=0; i<result.length; i++){
      var schedule = {
        couNum: result[i].cou_num,
        weekday: result[i].weekday,
        name: result[i].name,
        couName: result[i].cou_name,
        place: result[i].place,
        startTime: result[i].start_time,
        duringTime: result[i].during_time
      }
      schedules.push(schedule);
    }
    evt.emit('end', error, schedules);
  });
  return evt;
}

function getStuAttend(usrNum, couNum){
  var query = util.format( global.getStuAttend_query , usrNum, couNum);
  console.log(query);
  var evt = new EventEmitter();
  db.query(query, function (error, result, field) {
    var attends = [];
    for(var i=0; i<result.length; i++){
      var attend = {
        couName: result[i].cou_name,
        stuNum: result[i].stu_num,
        date: result[i].date,
        attCnt: result[i].att_cnt
      }
      attends.push(attend);
    }
    evt.emit('end', error, attends);
  });
  return evt;
}
function getUsersInfo(usrNums){
  var usrNumStr = '';
  for(var i=0; i<usrNums.length; i++){
    if(i != 0)
      usrNumStr += ',';
    usrNumStr += usrNums[i];
  }
  var query = util.format( global.getUsersInfo_query , usrNumStr);
  console.log(query);
  var evt = new EventEmitter();
  db.query(query, function (error, result, field) {
    var users = [];
    for(var i=0; i<result.length; i++){
      var user = {
        usrNum: result[i].usr_num,
        id: result[i].id,
        name: result[i].name
      }
      users.push(user);
    }
    evt.emit('end', error, users);
  });
  return evt;
}

exports.doLogin = doLogin;
exports.getCourse = getCourse;
exports.getSchedule = getSchedule;
exports.getStuAttend = getStuAttend;
exports.getUsersInfo = getUsersInfo;
