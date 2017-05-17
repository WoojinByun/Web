var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule.js');
var user = {};
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
