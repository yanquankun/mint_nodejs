var express = require('express');
var router = express.Router();
var db = require("../db/mysql"); //引入数据库封装模块

/* index page */
router.get('/login', function (req, res, next) {
  res.render('index', { title: '登录' });
  // console.log(res)
  // console.log(req)
});

router.get('/getuser', function (req, res) {
  var users = "";
  db.query("SELECT * FROM mint_users", [], function (results, fields) {
    console.log(results)
    let result = {
      err: 0,
      msg: 'ok',
      data: results
    }
    res.send(result);
  })
})
module.exports = router;
