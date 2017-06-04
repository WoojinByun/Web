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
  params = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});
router.get('/', function(req, res, next) {
  display(req, res);
});

router.post('/attend', function(req, res, next) {
});

router.post('/', function(req, res, next) {
  var datas = {};
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err);
    }
    datas = fields;
  });
  form.on('end', function(fields, files) {
    console.log('datas = ', datas);
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
          var imgs = getDescriptor(rootDir + '/' + newLoc, newFileName);
          var isNoPerson = false;
          if(imgs == undefined){
            imgs = [{imgSrc:'/img/noimage.jpg', id: '-', name: '검출된 사람이 없습니다.'}];
            isNoPerson = true;
          }
          console.log(imgs);
          imgs.sort(function compareNumbers(a, b) {return parseInt(a.usrNum) - parseInt(b.usrNum);});
          console.log(imgs);
          datas.usrNums = "";
          for(var j=0; j<imgs.length; j++){
            datas.usrNums.push(imgs[j].usrNum);
          }
          if(isNoPerson){
            params.users = imgs;

            console.log('user : ', params.user);
            console.log('courses : ', params.courses);
            console.log('users : ', params.users);
            if(!params.users){
              return;
            }
            res.render('checkAttendDisplay', { title: 'checkAttendDisplay', params: params});
            return;
          }
          dbmodule.doAttend(datas);
          var userEvt = dbmodule.getUsersInfo(datas.usrNums);
          userEvt.on('end', function(error, users){
            if (error) {
              res.writeHead(500);
              res.end();
            }

            for(var j=0; j<users.length; j++){
              users[j].imgSrc = imgs[j].imgSrc;
            }
            params.users = users;

            console.log('user : ', params.user);
            console.log('courses : ', params.courses);
            console.log('users : ', params.users);
            if(!(params.users)){
              return;
            }
            res.render('checkAttendDisplay', { title: 'checkAttendDisplay', params: params});

          });
        }
      });
    }
  });
});

function display(req, res){
  console.log('user : ', params.user);
  console.log('courses : ', params.courses);
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
  var attendedImgs = [];
  for(var i=0; i<afterImgs.length; i++){
    shell.cd(rootDir + '/../caffe/build/extract_descriptor/');
    console.log('-----------------' + './extract_descriptor ' + userDir + ' ' + afterImgs[i]);
    shell.exec('./extract_descriptor ' + userDir + ' ' + afterImgs[i]);
    shell.cd(rootDir + '/../face_recognition/src/build/');
    console.log('-----------------' + './check_attendance ' + afterImgs[i].replace('.png','.txt') + ' 34 35 37 11');
    var file = shell.exec('./check_attendance ' + afterImgs[i].replace('.png','.txt') + ' 34 35 37 11').stdout;
    if(file.indexOf('absence') == -1){
      attendedImgs.push({usrNum: file.split('/')[8], imgSrc: afterImgs[i].replace('/home/wj/work/Im_Here/Web/public','')});
    }
  }
  shell.cd(rootDir);
  if(attendedImgs.length != 0)
    return attendedImgs;
}

module.exports = router;
