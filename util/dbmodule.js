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
      }
    });
  }
});

function doLogin(req, res){
  var id = req.body.id;
  var pw = req.body.pw;
  var query = util.format( global.doLogin_query , id, pw);
  db.query(query, function (error, result, field) {
    if (error) {
      res.writeHead(500);
      res.end();
    } else {
      if(result[0] && result[0].usr_num){
        req.session.user = {
          usr_num: result[0].usr_num,
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

function getCourse(userId){
  var query = util.format( global.getCourse_query , userId);
  var evt = new EventEmitter();
  db.query(query, function (error, result, field) {
    var courses = [];
    for(var i=0; i<result.length; i++){
      var course = {
        cou_num: result[i].cou_num,
        cou_name: result[i].cou_name,
        pro_name: result[i].pro_name
      }
      courses.push(course);
    }
    evt.emit('end', error, courses);
  });
  return evt;
}

function getSchedule(userId){
  var query = util.format( global.getSchedule_query , userId);
  console.log(query);
  var evt = new EventEmitter();
  db.query(query, function (error, result, field) {
    var schedules = [];
    for(var i=0; i<result.length; i++){
      var schedule = {
        cou_num: result[i].cou_num,
        weekday: result[i].weekday,
        name: result[i].name,
        cou_name: result[i].cou_name,
        place: result[i].place,
        start_time: result[i].start_time,
        during_time: result[i].during_time
      }
      schedules.push(schedule);
    }
    evt.emit('end', error, schedules);
  });
  return evt;
}

exports.doLogin = doLogin;
exports.getCourse = getCourse;
exports.getSchedule = getSchedule;
