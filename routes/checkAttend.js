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

router.use(function(req, res, next){
  params = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
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

router.post('/', function(req, res, next) {
  var form = new formidable.IncomingForm();
  var datas = {};
  form.parse(req, function(err, fields, files) {
    if (err) {
      console.error(err);
    }
    datas = fields.timeData.split('/');
    datas = {couNum: datas[0], order: datas[1], time: formatDate(datas[2])};
  });
  form.on('end', function(fields, files) {
    // console.log('datas = ', datas);
    for (var i=0; i < this.openedFiles.length; i++) {
      var tempPath = this.openedFiles[i].path;
      var fileName = this.openedFiles[i].name;
      var fileExt = fileName.split(".")[fileName.split(".").length-1].toLowerCase();
      var index = fileName.indexOf('/');
      var newLoc = 'public/attChk/temp/';

      var newFileName = 'attTest.' + fileExt;
      console.log(tempPath, newLoc + newFileName);
      fs.remove(newLoc + newFileName, function(err){
        if (err) {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!!!");
          console.error(err);
          return console.error(err);
        }

        console.log("------------ remove success! --------------")
      });

      fs.copy(tempPath, newLoc + newFileName, function(err) {
        if (err) {
          console.error(err);
        } else {
          console.log(newLoc + newFileName + ' has been saved!');
          params.concentRate = getHeadTrack(rootDir + '/' + newLoc, newFileName);
          var stuNumsEvt = dbmodule.getCourseStuAll(datas.couNum);
          stuNumsEvt.on('end', function(error, stuNums){
            if(error) {
              res.writeHead(500);
              res.end();
            }
            var imgs = getDescriptor(rootDir + '/' + newLoc, newFileName, stuNums.toString().replace(/,/g, ' '));
            var isNoPerson = false;
            if(imgs == undefined){
              imgs = [{imgSrc:'/img/noimage.jpg', id: '-', name: '검출된 사람이 없습니다.'}];
              isNoPerson = true;
            }
            // console.log(imgs);
            imgs.sort(function compareNumbers(a, b) {return parseInt(a.usrNum) - parseInt(b.usrNum);});
            // console.log(imgs);
            datas.usrNums = [];
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
          });
        }
      });
    }
  });
});

function display(req, res){
  console.log('user : ', params.user);
  console.log('courses : ', params.courses);
  // console.log('timeDatas : ', params.timeDatas);
  if(!(params.timeDatas)){
    return;
  }
  res.render('checkAttend', { title: 'checkAttend', params: params});
}

function getDescriptor(filePath, fileName, stuNums){
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
    console.log('-----------------' + './check_attendance ' + afterImgs[i].replace('.png','.txt') + ' ' + stuNums);
    var file = shell.exec('./check_attendance ' + afterImgs[i].replace('.png','.txt') + ' ' + stuNums).stdout;
    if(file.indexOf('absence') == -1){
      attendedImgs.push({usrNum: file.split('/')[8], imgSrc: afterImgs[i].replace('/home/wj/work/Im_Here/Web/public','')});
    }
  }
  shell.cd(rootDir);
  if(attendedImgs.length != 0)
    return attendedImgs;
}

function getHeadTrack(filePath, fileName){
  var userDir = filePath.replace('/temp','');
  shell.cd(rootDir + '/../face_recognition/src/build/').stdout;
  var concentRate = shell.exec('./head_track ' + filePath + fileName);
  shell.cd(rootDir);
  return concentRate;
}

function formatDate(date) {
  var d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear(),
  hour = '' + d.getHours(),
  minute = '' + d.getMinutes();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  if (hour.length < 2) hour = '0' + hour;
  if (minute.length < 2) minute = '0' + minute;

  return [year, month, day].join('-') + " " + [hour,minute].join(':') ;
}

module.exports = router;
