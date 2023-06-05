var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var userRouter = require('./routes/users');

var db = require('./config/connection')

var app = express();

var session = require('express-session')
var ConnectMongoDBSession = require("connect-mongodb-session");
var mongoDbSesson = new ConnectMongoDBSession(session);
var hbs = require('express-handlebars')
var fileUpload = require('express-fileupload')
var multer = require('multer');
const { handlebars } = require('hbs');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(fileUpload())


app.use(function (req, res, next) {
  res.set("cache-control", "no-cache,no-store,must-revalidate");
  next();
});
//app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(session({secret:"Key",cookie:{maxAge:600000}}))
app.use(
  session({
    secret: "key",
    cookie: { maxAge: 600000 },
    resave: true,
    // store: new mongoDbSesson({
    //   uri: "mongodb://localhost:27017/Evara",
    //   collection: "session",
    // }),
    saveUninitialized: true,
  })
);
app.engine('hbs', hbs.engine({
  extname: 'hbs', defaultLayout: 'layout',
  layoutsDir: __dirname + '/views/layout/',
  partialsDir: __dirname + '/views/partials/',
  helpers:{
    counter:(inc)=>inc+1,
    ifNotEquals:function(arg1, arg2, options){
      return (arg1 != arg2) ? options.fn(this) : options.inverse(this);
    },
    ifEq: function(arg1, arg2, arg3, options){
      return ((arg1 == arg2)||(arg1 == arg3)) ? options.fn(this) : options.inverse(this);
    },
    ifEquals: function(state, value, options) {
      return (state == value) ? options.fn(this) : options.inverse(this);
    },
    ifReq: function(arg1, arg2, arg3,arg4, options){
      return ((arg1 == arg2)&&(arg3 == arg4)) ? options.fn(this) : options.inverse(this);
    },
    switch: function(value, options) {
      this.switch_value = value; return options.fn(this);
    },
    case: function(value, options) {
      if (value == this.switch_value) { return options.fn(this);
      }
    },
    multiply: function(thing1, thing2) {
      return thing1 * thing2 ;
    },
    ifGreater:function(state, value, options) {
      return (state < value) ? options.fn(this) : options.inverse(this);
    },
    ifNotGr :function(state, value, options) {
      return (state < value) ? options.fn(this) : options.inverse(this);
    },
    ifTEq: function(arg1, arg2, arg3,arg4, options){
      return ((arg1 == arg2)||(arg1 == arg3)||(arg1 == arg4)) ? options.fn(this) : options.inverse(this);
    },
  }
}))
app.use('/admin', adminRouter);
app.use('/', userRouter);

db.connect((err) => {
  if (err) {
    console.log("connection error" + err);
  }
  else {
    console.log("Database connected to port 27017");
  }

})



// catch 404 and forward to error handler
app.use(function (req, res, next) {
  res.render('users/pagenotfound')
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;
