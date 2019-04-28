const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port: 5002});

// WEB SOCKET FOR RESTAURANT USERS
wss.on("connection", (ws) => {
    // message is only served to help restaurant find driver's location
    ws.onmessage = (e) => {
        var id = JSON.parse(e.data).id; // id as order's id
        UserManager.tobeRequestedLocation.push(id);
        // time out after 10s
        var startingTime = new Date().getTime();
        var driverLocation = null;
        while(driverLocation === null){
            if(UserManager.driverTrackerResponse.length > 0){
                UserManager.driverTrackerResponse.map(trackerResponse => {
                    if(trackerResponse.id === id){
                        driverLocation = trackerResponse.driverLocation;
                        ws.send(JSON.stringify({message: "success", id, driverLocation}))
                    }
                })
            }
            if(new Date().getTime() - startingTime >= 10000){
                break;
            }
        }
        ws.send(JSON.stringify({message: "failed", driverLocation}))
    }

    setInterval(() => {
        var orderUpdates = UserManager.tobeNotifiedRestaurants; 
        if(orderUpdates.length > 0){
        // if there is an order's delivery update
        // broadcast to all clients/ connected restaurant, only client with exact uuid can receive request
         // order update is taken by FIFO
         var orderUpdate = orderUpdates.shift();
         ws.send(JSON.stringify(orderUpdate));
        }
     }, 1000);
})


router.post("/today", (req, res) => {
    UserManager.getOnlineUsers(req.body.restaurant_uuid).then(info => {
        connection.query(`SELECT id, customer_name AS customerName,
                                customer_address AS customerAddress,
                                customer_phone AS customerPhone,
                                items AS orderedItems, driver_id, delivery_status AS deliveryStatus FROM orders
                                WHERE restaurant_id=${info.id} AND DAY(order_date)=DAY(NOW())`, (err,rows) => {
                if(err) {console.log(err);res.json(err)}
                else {
                    if(rows.length > 0){
                        //prepare orderedItems to correct format
                        
                    }
                    var payload = {
                        numOfResults: rows.length,
                        rows
                    }
                    res.json(payload);
                }
        })
    }).catch(err => res.send(err))
})

router.post("/add-orders", (req, res) => {
    var deliveryDetails = req.body.deliveryDetails;
    var orders = deliveryDetails.orders;
    UserManager.getOnlineUsers(req.body.restaurant_uuid).then(info => {
        var restaurant_id = info.id;
        var query = "INSERT INTO orders(restaurant_id, customer_name, customer_address, customer_phone, items) VALUES ?";
        var values = [];
        orders.map(order => {
            const {customerName, customerAddress, customerPhone, orderedItems } = order;
            const items =  JSON.stringify(orderedItems);
            values.push([restaurant_id, customerName, customerAddress, customerPhone, items]);
        })
        connection.query(query, [values], (err, resultForThisRequest) => {
            if(err) {console.log(err); res.json("failed");}
            else if(resultForThisRequest.affectedRows > 0){
                //{deliveryDetails:{restaurant:{name, address, geocode:{latitude, longitude}}
                // , orders:[{order:{id, customerInfo, items, estimatedDeliveryTime}}]}}
                var insertedId = resultForThisRequest.insertId;
                orders.map(order => {
                    // add id (order_id)
                    order.id = insertedId;
                    insertedId++;
                })
                UserManager.addPendingOrder(deliveryDetails, false); // this is new order, never been rejected (false) by driver
            }
        })
    }).catch(err => console.log(err));
    
})

router.get("/test/pendingOrders", (req, res) => {
    res.send(UserManager.pendingOrders);
})

router.get("/test/notifiedList", (req, res) => {
    res.send(UserManager.tobeNotifiedRestaurants);
})

module.exports = router;
