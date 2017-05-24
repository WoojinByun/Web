var express = require('express');
var router = express.Router();
var shell = require('shelljs');
var fs = require('fs-extra');
var formidable = require('formidable');
var sessioning = require('../../util/sessioning');
var dbmodule = require('../../util/dbmodule.js');
var errorControl = require('../../util/errorControl');
var errCtl = errorControl.errCtl;
var params = {};

router.use(function(req, res, next){
  params = {}
  params.user = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});

router.post('/', function(req, res, next) {
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
      var newLoc = 'public/faceImage/' + params.user.usrNum + '/temp/';
      var imgs = shell.ls(newLoc + '*.*g').stdout.split('\n');

      var newFileName = 'temp.' + fileExt;
      console.log(tempPath, newLoc + newFileName);
      fs.copy(tempPath, newLoc + newFileName, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(newLoc + newFileName + ' has been saved!');
          var discs = getDescriptor(__dirname.replace('/routes/user','') + '/' + newLoc, newFileName);
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
  console.log('user : ', params.user);
  console.log('courses : ', params.courses);
  if(!(params.courses)){
    return;
  }
  res.render('user/register', { title: 'register', params: params});
}

function getDescriptor(filePath, fileName){
  var userDir = filePath.replace('/temp','')
  var beforeImgs = shell.ls(userDir + '*.*g').stdout.split('\n');
  shell.cd('../face_recognition/src/build/');
  shell.exec('./crop ' + userDir + ' ' + filePath+fileName);
  shell.rm(filePath+fileName);
  shell.cd(userDir);
  var afterImgs = shell.ls(userDir + '*.*g').stdout.split('\n');
  afterImgs = afterImgs.filter(function(e) {
    return beforeImgs.indexOf(e) < 0;
  });
  shell.cd('../../../../caffe/build/extract_descriptor/');
  for(var i=0; i<afterImgs.length; i++){
    shell.exec('./extract_descriptor ' + userDir + ' ' + afterImgs[i]);
  }
  shell.cd(userDir+'../../../');
}

module.exports = router;
