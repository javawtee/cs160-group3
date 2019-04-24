const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");

router.post('/login', (req, res) => {
    var uuid = req.body.uuid; // a reference index for user in back-end
    var uid = req.body.userId
    var pw = req.body.password
    connection.query("SELECT id, userName,userType,phoneNumber,email,approvedDate FROM users" +  
                          " WHERE userId=? AND password=? AND approved=1",[uid, pw] , (err, rows) => {
      if(err) throw err
      else {
        // create a variable to load results
        var payload = {
          numOfResults : rows.length,
          results: []
        }
        if(rows.length > 0) {
          // use userType to determine group of users in back-end
          payload.results.push({
            uuid,
            userName: rows[0].userName,
            userType: rows[0].userType,
            phoneNumber: rows[0].phoneNumber,
            email: rows[0].email,
            approvedDate: rows[0].approvedDate
          })
          // successfully logged in, store in array of online users
          var id = rows[0].id;
          UserManager.addOnlineUsers({uuid, id})
        }
        // else send default initialization of data
        res.json(payload);
      }
    })
});

router.get('/exists/:userId', (req, res) => {
  const userId = req.params.userId;
  if(userId !== undefined){
    connection.query("SELECT email FROM users WHERE userId=?", [userId], (err, rows) => {
          if(err) throw err
          else {
            var payload = {
              numOfResults: rows.length,
              email: null,
            }
            if(rows.length > 0){
              payload.email = rows[0].email;
            }
            res.json(payload);
          }
    })
  }
})

router.post('/sign-up/:userType', (req, res) => {
    const userType = req.params.userType;
    const userID = req.body.userId;
    const pw = req.body.password;
    const name = userType === "driver" ? req.body.firstName + " " + req.body.lastName : req.body.restaurantName;
    const address = userType === "driver" ? null : req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const submittedDate = new Date();
    //console.log('INSERT INTO users(userId, password, userName, userType, address, phoneNumber, email, submittedDate)' + 
                           //'VALUES(?,?,?,?,?,?,?,?)'), [userID, pw, name, userType, address, phoneNumber, email]
    connection.query('INSERT INTO users(userId, password, userName, userType, address, phoneNumber, email, submittedDate)' + 
                                'VALUES(?,?,?,?,?,?,?,?)', [userID, pw, name, userType, address, phoneNumber, email, submittedDate],
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

// not test yet
router.post("/edit-information", (req,res) => {
  const {userId, oldPassword, newPassword, phoneNumber, email, address} = req.body;
  if(newPassword === undefined ){
    connection.query("SELECT userId from users WHERE userId=? AND password=?", [userId, oldPassword], (err, rows) => {
      if(err) throw err
      else {
        var payload = {
          numOfResults : rows.length,
        }
        res.json(payload);
      }
    })
  }
  if(phoneNumber !== undefined || email !== undefined || address !== undefined){
    connection.query("UPDATE users SET phoneNumber=?, email=?, address=?  " +
      "WHERE userId=? AND password=?",[phoneNumber, email, address, userId, oldPassword],
    (err, result) => {
      if(err) throw err
      else {
        var payload = {
          numOfResults : result.affectedRows,
        }
        res.json(payload)
      }
    })
  }
})

router.get("/test1", (req,res) => {
  UserManager.getOnlineUsers("5357462e-2345-58bb-9617-a72775f99607").then(u => res.send(u)).catch(err => res.send(err))
  //const a = UserManager.getOnlineUsers().then(test => res.send(test));
})

module.exports = router;
