const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");

router.get("/:restaurant_uuid/today", (req, res) => {
    // set to user session in front-end => less httpGET's
})

router.post("/:restaurant_uuid/add-orders", (req, res) => {
    const orders = req.body.orders;
    console.log(orders);
    UserManager.getOnlineUsers(req.params.restaurant_uuid).then(id => {
        var restaurant_id = id;
        orders.map(order => {
            const {customerName, customerAddress, customerPhone, orderedItems } = order;
            const items =  JSON.stringify(orderedItems);
            connection.query("INSERT INTO orders(restaurant_id, customer_name, customer_address, customer_phone, items)" + 
            " VALUES (?, ?, ?, ?, ?)", [restaurant_id, customerName, customerAddress, customerPhone, items],
                (err, resultForThisOrder) => {
                if(err) {console.log(err); res.json("failed ");}
                else {
                    if(resultForThisOrder.affectedRows > 0){
                        // successful placed order
                        res.json("yesssssssssssssssssss");
                    } else {
                        //failed
                        res.json("failed here");
                    }
                }
            })
        })
    }).catch(err => console.log(err));
    
})

module.exports = router;