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

router.post('/upload', function(req, res, next) {
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
      var newLoc = 'images/' + params.user.usrNum + '/';
      var imgs = shell.ls(newLoc + '*.*g').stdout.split('\n');
      var j;

      imgs.splice(imgs.length-1,1);
      for(var j=0; j<imgs.length; j++){
        imgs[j] = parseInt(imgs[j].replace(newLoc+'img','').split('.')[0]);
      }
      imgs = imgs.sort(function(a,b){return a-b;}); // compare with number
      for(j=0; j<imgs.length; j++){
        if(imgs[j] != j) break;
      }
      var newFileName = 'img' + j + '.' + fileExt;
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
  shell.cd('../face_recognition/src/build/');
  shell.exec('./crop ' + filePath + ' ' + filePath+fileName);
  shell.rm(filePath+fileName);
  // shell.cd('../face_recognition/src/build/crop ' + fullFileName + params.user.usrNum);
  // console.log('-----------> ' + './extract_vector ' + fullFileName);
  // shell.exec('./extract_vector ' + fullFileName);
  // shell.cd('../../../Web/images/' + params.user.usrNum);
  // var str = shell.cat(fileName.replace('.jpg','') + '*.txt');
  // var discs = str.stdout.split("\n");
  // discs.forEach(function(disc){
  //   var arr = disc.split(/\s+/);
  //   arr.splice(129,1);
  //   arr.splice(0,1);
  //   console.log('--------------------------------------------------'+arr.length+'------------------------------------------------------------');
  //   console.log(arr);
  // });
}

module.exports = router;
