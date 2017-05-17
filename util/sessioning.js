var express = require('express');
var dbmodule = require('../util/dbmodule.js');

function getSession(req){
  if(req.session.user)
    return req.session.user;
  else
    return false;
}
function doLogout (req, res) {
  req.session.destroy();
  res.clearCookie('sid');
  res.redirect('/');
};
exports.doLogin = dbmodule.doLogin;
exports.doLogout = doLogout;
exports.getSession = getSession;
