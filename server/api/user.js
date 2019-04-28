const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");

router.post('/login', (req, res) => {
    var uuid = req.body.uuid; // a reference index for user in back-end
    var uid = req.body.userId
    var pw = req.body.password
    connection.query("SELECT id, userName, userType,phoneNumber,email,approvedDate FROM users" +  
      " WHERE userId=? AND password=? AND approved=1",
      [uid, pw] , (err, rows) => {
        if(err) throw err
        else {
          // create a variable to load results
          var payload = {
            numOfResults : rows.length,
            results: []
          }
          if(rows.length > 0) {
            var id = rows[0].id; // users_id
            // only restaurant has property address
            getAddress = () => {
              return new Promise((resolve,reject) => {
                if(typeof(rows[0].userType) === "string" && rows[0].userType === "restaurant"){
                  connection.query("SELECT address FROM restaurant WHERE users_id=?", [id], (err, restaurant_rows) =>{
                    if(err) {console.log(err); throw err}
                    else if (restaurant_rows.length > 0){
                      resolve(restaurant_rows[0].address);
                    }
                  })
                } else {
                  resolve(null);
                }
              })
            }
            getAddress().then(address => {
              // successfully logged in, store in array of online users
              payload.results.push({
                uuid,
                userName: rows[0].userName,
                userType: rows[0].userType,
                phoneNumber: rows[0].phoneNumber,
                email: rows[0].email,
                approvedDate: rows[0].approvedDate,
                address, // restaurant.address || null
              })
              UserManager.addOnlineUsers({uuid, id, address})
              res.json(payload);
            });
          } else {
            // else send default initialization of data
            res.json(payload);
          }
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
    const userId = req.body.userId;
    const pw = req.body.password;
    const name = userType === "driver" ? req.body.firstName + " " + req.body.lastName : req.body.restaurantName;
    const address = userType === "driver" ? null : req.body.address;
    const phoneNumber = req.body.phoneNumber;
    const email = req.body.email;
    const submittedDate = new Date();
    connection.query('INSERT INTO users(userId, password, userName, userType, phoneNumber, email, submittedDate)' + 
                                'VALUES(?,?,?,?,?,?,?)', [userId, pw, name, userType, phoneNumber, email, submittedDate],
      (err, result) => {
          if(err) {console.log(err);throw err;}
          else {
            var payload = {
              numOfResults : 0,
            }
            if(result.affectedRows > 0) {
              payload.numOfResults = result.affectedRows
              if(userType === "restaurant"){
                var stockLogoUrl = "/media/stock-photo.jpg";
                connection.query("INSERT INTO restaurant(users_id, address, logoUrl) VALUES (?,?,?)", [result.insertId, address, stockLogoUrl]
                  ,(err, result) => {
                    if(err) {console.log(err);throw err;}
                    else {
                      payload.numOfResults = result.affectedRows;
                    }
                  })
              }
            }
            res.json(payload)
          }
    })
});

// not test yet
router.post("/edit-information", (req,res) => {
  const {uuid, oldPassword, newPassword, phoneNumber, email, address} = req.body;
  UserManager.getOnlineUsers(uuid).then(a => {
      var id = a.id;
      var payload = {
        numOfResults : 0,
      }

      if(newPassword === undefined ){
        connection.query("SELECT id from users WHERE id=? AND password=?", [id, oldPassword], (err, rows) => {
            if(err) {console.log(err);}
            else {
              payload.numOfResults = rows.length;
              res.json(payload);
            }
          }
        )
      }
      
      if(phoneNumber !== undefined || email !== undefined){
        connection.query("UPDATE users SET phoneNumber=?, email=? WHERE id=?",[phoneNumber, email, id],
          (err, rows) => {
            if(err) {console.log(err);}
            else {
              payload.numOfResults = rows.affectedRows;
              res.json(payload);
            }
          }
        )
      }
  
      if(address !== undefined && address !== null){
        connection.query("UPDATE restaurant SET address=? WHERE users_id =?",[address, id],
          (err, rows) => {
            if(err) {console.log(err);}
            else {
              payload.numOfResults = rows.affectedRows;
              res.json(payload);
            }
          }
        )
      }
  }).catch(err => console.log(err))
})

router.get("/test1", (req,res) => {
  UserManager.getOnlineUsers("0f457377-b8b6-539b-8f56-2114155fab6e").then(u => res.send(u)).catch(err => res.send(err))
  //const a = UserManager.getOnlineUsers().then(test => res.send(test));
})

module.exports = router;
