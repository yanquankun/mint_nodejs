var express = require('express');
var router = express.Router();
var db = require("../db/mysql"); //引入数据库封装模块

/* login page */
router.get('/login', function (req, res, next) {
  res.render('login', { title: '登录' });
  // console.log(res)
  // console.log(req)
});

router.get('/getuser', function (req, res) {
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
module.exports = router;
