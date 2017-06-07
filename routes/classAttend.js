var express = require('express');
var router = express.Router();
var shell = require('shelljs');
var fs = require('fs-extra');
var formidable = require('formidable');
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule.js');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;
var params = {};
var rootDir = __dirname.replace('/routes','');

////////////////////for DEMO!!!!!!!!!!!!!!
router.post('/attend', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err);
    }
  });
  form.on('end', function(fields, files) {
    for (var i=0; i < this.openedFiles.length; i++) {
      var tempPath = this.openedFiles[i].path;
      var fileName = this.openedFiles[i].name;
      var fileExt = fileName.split(".")[fileName.split(".").length-1].toLowerCase();
      var index = fileName.indexOf('/');
      var newLoc = 'public/rasp/';

      var newFileName = 'attTest.' + fileExt;
      console.log(tempPath, newLoc + newFileName);
      fs.copy(tempPath, newLoc + newFileName, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(newLoc + newFileName + ' has been saved!');
          res.send('1');
        }
      });
    }
  });
});
router.use(function(req, res, next){
  params = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});

router.post('/', function(req, res, next) {

});
router.get('/', function(req, res, next) {

  display(req, res);
});

function display(req, res){
  console.log('user : ', params.user);
  console.log('courses : ', params.courses);
  getCurrentImage();
  res.render('checkAttend', { title: 'checkAttend', params: params});
}
function getCurrentImage(){
  var image = {};
  console.log(shell.ls('public/rasp/attTest.*g').stdout.replace('public/','').split('\n')[0]);
}
module.exports = router;
