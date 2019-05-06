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
const UserManager = require("./api/userManager");

// admin page
app.get("/", res => {
  UserManager.fetchListOfUsers()
  .then(listOfUsers => res.render("admin", {listOfUsers}));
})

app.get("/approve/:userId/:email", (req, res) => {
  require("./api/connector").query("UPDATE users SET approved=1,approvedDate=NOW() WHERE userId=?",[req.params.userId], err => {
    if(err){console.log(err); throw err;}
    else {
        require('./api/mailer')(req.params.email, `Welcome to our Delivery Service`
        `Your account with userID: <b>${req.params.userId}</b> is activated.<br/>
         You are able to login to our service now.<br/>
         Best regards,<br/>
         Fake customer service`).then(() => alert("success")).catch(() => alert("failure"));
        res.redirect("/");
    }
})
})

// send current password to user's email (ForgotPassword)
app.post("/mailer", (req, res) => {
  const {userId, to, subject} = req.body;
  require("./api/connector").query("SELECT password from users WHERE userId=?", [userId], (err, result) => {
    if(err) {console.log(err); res.json("failure"); throw err;}
    else {
      var content = `
        userID: <b>${userId}</b>, password: <b>${result[0].password}</b><br/>
        Best regards,<br/>
        Fake customer service`;
      require('./api/mailer')(to, subject, content).then(() => res.json("success")).catch(err => res.json("failure"));
    }
  })
})

// get any url start with /user and match the router.get/post/..whatever
app.use("/user", require("./api/user"));
app.use("/restaurant", require("./api/restaurant"));
app.use("/driver", require("./api/driver"));

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
