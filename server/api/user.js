const express = require("express");
const router = express.Router();
const connection = require("./connector");

router.post('/login', (req, res) => {
    var uid = req.body.userId
    var pw = req.body.password
    connection.query("SELECT userId,userName,userType,address,phoneNumber,email,approvedDate FROM users" +  
                          " WHERE userId=? AND password=? AND approved=1",[uid, pw] , (err, rows) => {
      if(err) throw err
      else {
        // create a variable to load results
        var payload = {
          numOfResults : rows.length,
          results: []
        }
        if(rows.length > 0) {
          payload.results.push({
            userId: rows[0].userId,
            userName: rows[0].userName,
            userType: rows[0].userType,
            address: rows[0].address,
            phoneNumber: rows[0].phoneNumber,
            email: rows[0].email,
            approvedDate: rows[0].approvedDate
          })
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
              numOfResults : rows.length,
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

module.exports = router;
