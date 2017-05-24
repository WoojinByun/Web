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
      var newLoc = 'public/attChk/temp/';

      var newFileName = 'attTest.' + fileExt;
      console.log(tempPath, newLoc + newFileName);
      fs.copy(tempPath, newLoc + newFileName, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(newLoc + newFileName + ' has been saved!');
          var discs = getDescriptor(rootDir + '/' + newLoc, newFileName);
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
  res.render('checkAttend', { title: 'checkAttend', params: params});
}

function getDescriptor(filePath, fileName){
  var userDir = filePath.replace('/temp','')
  var beforeImgs = shell.ls(userDir + '*.*g').stdout.split('\n');
  shell.cd(rootDir + '/../face_recognition/src/build/');
  shell.exec('./crop ' + userDir + ' ' + filePath + fileName);
  shell.rm(filePath + fileName);
  shell.cd(userDir);
  var afterImgs = shell.ls(userDir + '*.*g').stdout.split('\n');
  afterImgs = afterImgs.filter(function(e) {
    return beforeImgs.indexOf(e) < 0;
  });
  var files = [];
  for(var i=0; i<afterImgs.length; i++){
    shell.cd(rootDir + '/../caffe/build/extract_descriptor/');
    console.log('-----------------' + './extract_descriptor ' + userDir + ' ' + afterImgs[i]);
    shell.exec('./extract_descriptor ' + userDir + ' ' + afterImgs[i]);
    shell.cd(rootDir + '/../face_recognition/src/build/');
    console.log('-----------------' + './check_attendance ' + userDir + ' ' + afterImgs[i].replace('.png','.txt') + ' 34 35 37');
    var file = shell.exec('./check_attendance ' + userDir + ' ' + afterImgs[i].replace('.png','.txt') + ' 34 35 37').stdout;
    files.push(file);
  }
  console.log('---------------------=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=--');
  console.log(files);
  console.log('---------------------=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=---=-=-=-=--');

  shell.exec('rm -rf ' + rootDir + '/public/attChk');
  shell.cd(rootDir);
}

module.exports = router;
