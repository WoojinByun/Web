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

// for Raspberry Pie
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
  var datas = {};
  var form = new formidable.IncomingForm();
  console.log("what the fuck");
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err);
    }
    console.log("!!!!!!!!!!!!!!!!!!!!!!");
    console.log(fields);
  });

  form.on('end', function(fields, files) {
    console.log("END!");
    console.log(fields);
    console.log(files);
  });
  // datas = fields;
  // var imgs = getDescriptor(rootDir + '/public/rasp/', shell.ls('public/rasp/attTest.*g').stdout.replace('public/rasp/','').split('\n')[0]);
  // var isNoPerson = false;
  // if(imgs == undefined){
  //   res.redirect('/classAttend?msg='+'얼굴 검출에 실패하였습니다.');
  //   return;
  // }
  // imgs.sort(function compareNumbers(a, b) {return parseInt(a.usrNum) - parseInt(b.usrNum);});
  // var usrNums = [];
  // console.log(imgs);
  // console.log(datas);
  // for(var j=0; j<imgs.length; j++){
  //   usrNums.push(imgs[j].usrNum);
  // }
  // datas.usrNums = usrNums;
  // console.log(datas);
  // dbmodule.doAttend(datas);
  //
  // var userEvt = dbmodule.getUsersInfo(datas.usrNums);
  // userEvt.on('end', function(error, users){
  //   if (error) {
  //     console.log(error);
  //     res.writeHead(500);
  //     res.end();
  //   }
  //   for(var j=0; j<users.length; j++){
  //     users[j].imgSrc = imgs[j].imgSrc;
  //   }
  //   params.users = users;
  //   var attendTimeEvent = dbmodule.getAttendTimeAll(params.user.usrNum);
  //   attendTimeEvent.on('end', function(error, timeDatas){
  //     if (error) {
  //       console.log(error);
  //       res.writeHead(500);
  //       res.end();
  //     }
  //     params.timeDatas = timeDatas;
  //     display(req, res);
  //   });
  // });
});

router.get('/', function(req, res, next) {
  var attendTimeEvent = dbmodule.getAttendTimeAll(params.user.usrNum);
  attendTimeEvent.on('end', function(error, timeDatas){
    if (error) {
      console.log(error);
      res.writeHead(500);
      res.end();
    }
    params.timeDatas = timeDatas;
    display(req, res);
  });
});

function display(req, res){
  console.log('user : ', params.user);
  console.log('courses : ', params.courses);
  // console.log('timeDatas : ', params.timeDatas);
  console.log('users : ', params.users);
  if(!(params.timeDatas)){
    return;
  }
  params.imageUrl = shell.ls('public/rasp/attTest.*g').stdout.replace('public','').split('\n')[0];
  res.render('classAttend', { title: 'classAttend', params: params});
}

function getDescriptor(filePath, fileName){
  var userDir = filePath.replace('/temp','')
  var beforeImgs = shell.ls(userDir + '*.*g').stdout.split('\n');
  shell.cd(rootDir + '/../face_recognition/src/build/');
  shell.exec('./crop ' + userDir + ' ' + filePath + fileName);
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
