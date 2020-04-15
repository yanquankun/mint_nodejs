var express = require('express');
var router = express.Router();
var db = require("../db/mysql"); //引入数据库封装模块
var dbConfig = require('../db/db.config');
var guid = require('../public/javascripts/guid.js');
/* login page */
router.get('/login', function (req, res, next) {
  res.render('login', { res: { title: '登录', reverTitle: '注册', router: 'http://' + dbConfig.host + ':3000/regis' } });
  // console.log(res)
  // console.log(req)
});
/* regis page */
router.get('/regis', function (req, res, next) {
  res.render('login', { res: { title: '注册', reverTitle: '登录', router: 'http://' + dbConfig.host + ':3000/login' } });
  // console.log(resport
  // console.log(req)
});
// 登录
router.get('/login/getuser', function (req, res) {
  const username = req.query.username;
  const password = req.query.password;
  db.query("SELECT * FROM mint_users", [], function (results, fields) {
    let result = {
      code: 404,
      msg: '用户名不存在',
      data: ''
    }
    for (let i = 0; i < results.length; i++) {
      if (results[i].username == username && results[i].password == password) {
        result.msg = '成功';
        result.code = 200;
      }
    }
    res.send(result);
  })
})
// 注册
router.get('/login/regis', function (req, res, next) {
  const username = req.query.username;
  const password = req.query.password;
  db.query("SELECT * FROM mint_users", [], function (results, fields) {
    let result = {
      code: 200,
      msg: '用户名已存在',
      data: ''
    }
    for (let i = 0; i < results.length; i++) {
      if (results[i].username == username) {
        result.code = 304;
        break
      }
    }
    if (result.code != 200) {
      res.send(result);
    } else {
      next();
    }
  })
}, function (req, res) {
  const username = req.query.username;
  const password = req.query.password;
  guid.setGuid();
  const Guid = guid.getGuid();
  const $sql = "INSERT INTO `mint_users` (`guid`, `username`, `email`, `password`, `phone`, `birthday`) VALUES ('" + Guid + "', '" + username + "', '', '" + password + "', '', NOW())";
  db.query($sql, function (results, fields) {
    let result = {
      code: 200,
      msg: '注册成功',
      data: ''
    }
    res.send(result);
  })
})
module.exports = router;
