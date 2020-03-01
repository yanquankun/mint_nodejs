var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();

// 设置模板引擎(默认express支持的模板引擎现在是ejs，我们可以通过如下代码将其修改为我们熟悉的html模板)
app.engine('html',require('ejs').__express);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(logger('dev'));

// 防止请求304  缓存问题
app.disable('etag');

//解析请求的body中的内容
app.use(express.json());
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use(cookieParser());
// 设置静态文件路径
app.use(express.static(path.join(__dirname, 'public')));

// 设置路由映射关系
var indexRouter = require('./routes/index');
app.use('/', indexRouter);// 主路由

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
