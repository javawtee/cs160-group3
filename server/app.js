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
  connection.query('SELECT userName FROM users WHERE userId=? AND password=?',[uid, pw] , (err, rows) => {
    if(err) throw err
    else {
      // create a variable to load results
      var payload = {
        numOfResults : rows.length,
        results: []
      }
      if(rows.length > 0) {
        payload.results.push(rows[0].userName) // expected only 1 property
      }
      // else send default initialization of data
      res.json(payload);
    }
  })
});

app.post('/isUserId/duplicate', (req, res) => {
  const userId = req.body.userId;
  connection.query('SELECT * FROM users WHERE userId=?', [userId], (err, rows) => {
        if(err) throw err
        else {
          var payload = {
            numOfResults : rows.length,
          }
          res.json(payload);
        }
  })
})

app.post('/createAccount/:userType', (req, res) => {
  const userType = req.params.userType;
  const userID = req.body.userId;
  const pw = req.body.password;
  const name = userType === "driver" ? req.body.firstName + " " + req.body.lastName : req.body.restaurantName;
  const address = userType === "driver" ? null : req.body.address;
  const phoneNumber = req.body.phoneNumber;
  const email = req.body.email;
  //console.log('INSERT INTO users(userId, password, userName, userType, address, phoneNumber, email)' + 
                         //'VALUES(?,?,?,?,?,?,?,?)'), [userID, pw, name, userType, address, phoneNumber, email]
  connection.query('INSERT INTO users(userId, password, userName, userType, address, phoneNumber, email)' + 
                              'VALUES(?,?,?,?,?,?,?)', [userID, pw, name, userType, address, phoneNumber, email],
    (err, result) => {
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
