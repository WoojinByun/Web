var express = require('express');
var router = express.Router();
var sessioning = require('../util/sessioning');
var dbmodule = require('../util/dbmodule');
var errorControl = require('../util/errorControl');
var errCtl = errorControl.errCtl;
var user = {};
var params = {};

router.use(function(req, res, next){
  params = sessioning.getSession(req);
  errCtl(res, next, !params.user, '/login', '로그인 페이지로 이동합니다.');
});
router.get('/', function(req, res, next) {
  var attendStatEvt = dbmodule.getAttendStatistic(params.user.usrNum);
  attendStatEvt.on('end', function(error, result){
    if (error) {
      console.log(error);
      res.writeHead(500);
      res.end();
    }
    if(result){
      var attendStats = {};
      attendStats.couNums = [];
      attendStats.datas = [];
      for(var i=0; i<result.length; i++){
        attendStats.couNums.push(result[i].couNum)
        attendStats.datas.push({
          "couName": result[i].couName,
          "출석": result[i].attCnt,
          "지각": result[i].latCnt,
          "결석": result[i].absCnt
        });
      }
      params.attendStats = JSON.stringify(attendStats);
    }
    display(req, res);
	});
});

function display(req, res){
  console.log("user : ", params.user);
  console.log("courses : ", params.courses);
  console.log("params.attendStats : ", params.attendStats);
  if(!params.attendStats){
    return;
  }
  res.render('index', { title: 'Main', params: params});
}
module.exports = router;
