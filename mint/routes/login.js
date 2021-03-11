var express = require('express');
var router = express.Router();
var db = require("../db/mysql"); //引入数据库封装模块
var dbConfig = require('../db/db.config');
var guid = require('../public/javascripts/guid.js');
var resBody = require('../db/response.body');
/* login page */
router.get('/login', function (req, res, next) {
  res.render('login', { res: { title: '登录', reverTitle: '注册', router: '/regis' } });
  // console.log(res)
  // console.log(req)
});
/* regis page */
router.get('/regis', function (req, res, next) {
  res.render('login', { res: { title: '注册', reverTitle: '登录', router: '/login' } });
  // console.log(resport
  // console.log(req)
});
// 获取所有用户
router.get('/user/getusers', function (req, res) {
  resBody.init();
  db.query("SELECT * FROM mint_users", [], function (results, fields) {
    resBody.code = res.statusCode;
    if (results.length) {
      resBody.data = results;
    } else {
      resBody.msg = 'failure';
      resBody.data = [];
    }
    res.send(resBody);
  })
})
// 登录
router.get('/user/loginUser', function (req, res) {
  resBody.init();
  const username = req.query.username;
  const password = req.query.password;
  db.query("SELECT * FROM mint_users where username = '" + username + "' and password = '" + password + "' ", [], function (results, fields) {
    resBody.code = res.statusCode;
    if(!results.length){
      resBody.msg = 'failure';
      resBody.data = [];
    }
    res.send(resBody);
  })
})
// 注册
router.get('/user/regis', function (req, res, next) {
  resBody.init();
  const username = req.query.username;
  const password = req.query.password;
  resBody.code = res.statusCode;
  db.query("SELECT * FROM mint_users", [], function (results, fields) {
    resBody.msg = '用户名已存在';
    for (let i = 0; i < results.length; i++) {
      if (results[i].username == username) {
        resBody.code = 304;
        break
      }
    }
    if (resBody.code != 200) {
      res.send(resBody);
    } else {
      next();
    }
  })
}, function (req, res) {
  const username = req.query.username;
  const password = req.query.password;
  guid.setGuid();
  const Guid = guid.getGuid().split('-').join("");
  const $sql = "INSERT INTO `mint_users` (`guid`, `username`, `email`, `password`, `phone`, `birthday`) VALUES ('" + Guid + "', '" + username + "', '', '" + password + "', '', NOW())";
  db.query($sql, function (results, fields) {
    resBody.msg = '注册成功';
    res.send(resBody);
  })
})
module.exports = router;
