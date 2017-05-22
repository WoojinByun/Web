var express = require('express');
var router = express.Router();
var shell = require('shelljs');
var fs = require('fs-extra');
var formidable = require('formidable');
var sessioning = require('../../util/sessioning');
var dbmodule = require('../../util/dbmodule.js');
var params = {};

router.use(function(req, res, next){
  params = {}
  params.user = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});

router.post('/upload', function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err);
    }
  });
  form.on('end', function(fields, files) {
    for (var i = 0; i < this.openedFiles.length; i++) {
      var tempPath = this.openedFiles[i].path;
      var fileName = this.openedFiles[i].name;
      var index = fileName.indexOf('/');
      var newLocation = 'images/' + params.user.usrNum + '/';
      console.log(tempPath);
      console.log(__dirname + '/' + newLocation + fileName);
      fs.copy(tempPath, newLocation+fileName, function(err) {
        if (err) {
          console.error(err);
        } else {
          var discs = getDescriptor(__dirname.replace('/routes/user','') + '/' + newLocation + fileName, fileName);
        }
      });
    }
  });

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
  res.render('user/register', { title: 'register', params: params});
}

function getDescriptor(fullFilePath, fileName){
  shell.cd('../face_recognition/src/build/');
  console.log('-----------> ' + './extract_vector ' + fullFilePath);
  shell.exec('./extract_vector ' + fullFilePath);
  shell.cd('../../../Web/images/' + params.user.usrNum);
  var str = shell.cat(fileName.replace('.jpg','') + '*.txt');
  var discs = str.stdout.split("\n");
  discs.forEach(function(disc){
    var arr = disc.split(/\s+/);
    arr.splice(129,1);
    arr.splice(0,1);
    console.log('--------------------------------------------------'+arr.length+'------------------------------------------------------------');
    console.log(arr);
  });
}

module.exports = router;
