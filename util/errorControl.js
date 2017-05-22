var express = require('express');
var dbmodule = require('../util/dbmodule.js');

function errCtl(res, next, isErr, redirUrl, errMsg){
  errMsg = errMsg != '' ? '?errMsg'+errMsg : '';
  if(isErr)
    res.redirect(redirUrl + errMsg);
  else
    next();
}
exports.errCtl = errCtl
