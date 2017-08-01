var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var connection = require('./model/mysql');

var router = require('./routes/index');
var users = require('./routes/users');
var captcha = require('./routes/captcha');
var imageUpload = require("./routes/imageUpload");

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret:"123456",
    name:"myapp",
    cookie:{maxAge:1000*60*30},
    resave: true,
    saveUninitialized: true
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {
    if(req.session.userName){
        res.locals.user = {userName:req.session.userName}
    }
    var sql = "select username,coins from users order by coins asc limit 0,10";
    connection.query(sql,function (error,result) {
        if(error) throw error;
        res.locals.userList = result;
        next();
    });

});
app.use(router);
app.use(users);
app.use(captcha);
app.use(imageUpload);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
