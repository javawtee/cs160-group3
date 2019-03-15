var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'testdb'
})

connection.connect((err) => {
  if(err) console.log('Welcome to Express JS. You are disconnected')
  else console.log('Welcome to Express JS. You are connected')
})

app.post('/login', (req, res) => {
  //var uid = 'tester1'
  //var pw = 'testerpw1'
  var uid = req.body.userName
  var pw = req.body.password
  console.log('SELECT user_name FROM users WHERE user_id =\'' + uid + '\' AND password=\'' + pw + '\'')
  connection.query('SELECT user_name FROM users WHERE user_id =\'' + uid + '\' AND password=\'' + pw + '\'', (err, rows, fields) => {
    if(err) throw err
    else {
      // create a variable to load results
      var payload = {
        numOfResults : 0,
        results: []
      }
      if(rows.length > 0) {
        payload.numOfResults = rows.length
        payload.results.push(rows[0].user_name) // expected only 1 property
      }
      // else send default initialization of data
      res.json(payload)
    }
  })
});

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
