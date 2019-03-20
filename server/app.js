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
  password: 'password',
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
  console.log('SELECT name FROM user WHERE userId =\'' + uid + '\' AND password=\'' + pw + '\'')
  connection.query('SELECT name FROM user WHERE userId =\'' + uid + '\' AND password=\'' + pw + '\'', (err, rows, fields) => {
    if(err) throw err
    else {
      // create a variable to load results
      var payload = {
        numOfResults : 0,
        results: []
      }
      if(rows.length > 0) {
        payload.numOfResults = rows.length
        payload.results.push(rows[0].name) // expected only 1 property
      }
      // else send default initialization of data
      res.json(payload)
    }
  })
});

app.post('/createAccount/driver', (req, res) => {
  var userID = req.body.userId
  var pass = req.body.password
  var fullName = req.body.firstName + " " + req.body.lastName
  var phoneNumber = req.body.phoneNumber
  var email = req.body.email
  console.log('INSERT INTO user VALUES(?,?,null,null,"driver",?,?,?)'), [userID, pass, fullName, email, phoneNumber]
  connection.query('INSERT INTO user VALUES(?,?,null,null,"driver",?,?,?)',[userID, pass, fullName, email, phoneNumber],(err, result) => {
    if(err) throw err
    else {
      var payload = {
        numOfResults : 0,
      }
      if(result.affectedRows > 0) {
        payload.numOfResults = result.affectedRows
      }
      res.json(payload)
    }
  })
});

app.post('/createAccount/restaurant', (req, res) => {
  var userID = req.body.userId
  var pass = req.body.password
  var restaurantName = req.body.restaurantName
  var address = req.body.address
  var phoneNumber = req.body.phoneNumber
  var email = req.body.email
  console.log('INSERT INTO user VALUES(?,?,null,null,"restaurant",?,?,?)'), [userID, pass, restaurantName, email, phoneNumber]
  connection.query('INSERT INTO user VALUES(?,?,null,null,"restaurant",?,?,?)',[userID, pass, restaurantName, email, phoneNumber],(err, result) => {
    if(err) throw err
    else {
      var payload = {
        numOfResults : 0,
      }
      if(result.affectedRows > 0) {
        payload.numOfResults = result.affectedRows
      }
      res.json(payload)
    }
  })
});

app.post('/add_inventory', (req, res) => {
  console.log("added to inventory!");

  let name = req.body.itemName;
  let quantity = req.body.quantity;
  let addr = req.body.deliveryAddress;

  //replace the sql command below
  connection.query('' + pw + '\'', (err, rows, fields) => {
    if(err) throw err
    else {
      //you can do some shit with the data 
      res.json(/* idk, some object */);
    }
  });

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
