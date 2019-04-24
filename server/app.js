var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// default express setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// view engine setup
app.engine('html', require('ejs').renderFile); // render view with html
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views/'));

//----------------------------------------------------------------

// admin page
app.get("/", (req,res) => {
  require("./api/userManager").fetchListOfUsers()
  .then(listOfUsers => res.render("admin", {listOfUsers}));
})

// send email
app.post("/mailer", (req,res) => {
  const {to, subject, content} = req.body;
  require('./api/mailer')(to, subject, content)
  .catch(err => res.json(err)) // check if there is any error returned => failed to send email
})

// get any url start with /user and match the router.get/post/..whatever
app.use("/user", require("./api/user"));
app.use("/restaurant", require("./api/restaurant"));

//----------------------------------------------------------------

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
