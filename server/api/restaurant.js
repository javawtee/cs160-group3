const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port: 5002});

// WEB SOCKET FOR RESTAURANT USERS
// fetching update to client
setInterval(() => {
    var orderUpdates = UserManager.tobeNotifiedRestaurants; //[{uuid, id (order.id),driverLocation,deliveryStatus}]
    if(orderUpdates.length > 0){
        // if there is an order's delivery update
        // broadcast to all clients/ connected restaurant, only client with exact uuid can receive request
        if(wss.clients.size > 0){
            console.log("fetching update, # of restaurant clients: " + wss.clients.size )
            // loop through orderUpdates to prevent losing update for client who might be disconnected
            orderUpdates.forEach(update => {
                wss.clients.forEach(function each(client) {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify(update));
                    }
                });
            }) 
        }
    }
}, 3000); 

wss.on("connection", ws => {
    var clientId = wss.clients.size -1;
    console.log("[CONNECT] a restaurant has recently joined, id = " + clientId);

    ws.on("message", e => {
        var metaData = JSON.parse(e);
        switch(metaData.message){
            case "received-update":
                console.log("An update received");
                var updates = UserManager.tobeNotifiedRestaurants;
                var rmUpdateIndex = updates.findIndex(update => update.uuid === metaData.uuid);
                updates.splice(rmUpdateIndex, 1);
                UserManager.writeSession();
                break;
            default:
                break;
        }
    })

    ws.on("close", () => {
        console.log("[DISCONNECT] a restaurant has just left, id = " + clientId);
    })
}) 


router.post("/today", (req, res) => {
    UserManager.getOnlineUsers(req.body.restaurant_uuid).then(info => {
        connection.query(`SELECT id, customer_name AS customerName, customer_address AS customerAddress, customer_phone AS customerPhone,
                                     items AS orderedItems, driver_id, delivery_status AS deliveryStatus, 
                                     delivery_fee as deliveryFee, driver_location as driverLocation 
                                     FROM orders
                                     WHERE restaurant_id=${info.id} AND DAY(order_date)=DAY(NOW()) AND delivery_status != 2`, (err,rows) => {
                if(err) {console.log(err);res.json(err)}
                else {
                    var payload = {
                        numOfResults: rows.length,
                        rows
                    }
                    res.json(payload);
                }
        })
    }).catch(err => res.send(err))
})

router.post("/history", (req, res) => {
    UserManager.getOnlineUsers(req.body.uuid).then(info => {
        connection.query(`SELECT customer_name AS customerName, customer_address AS customerAddress, 
                                    customer_phone AS customerPhone, items AS orderedItems, delivery_fee as deliveryFee
                                     FROM orders
                                     WHERE restaurant_id=${info.id} AND delivery_status = 2 ORDER BY order_date DESC`, (err,rows) => {
                if(err) {console.log(err);res.json(err)}
                else {
                    if(rows.length > 0){
                        res.json({message:"success", rows});
                    } else {
                        res.json({message:"no-result"})
                    }
                }
        })
    }).catch(() => res.json("error")) // error: no restaurant is found with uuid
})

router.post("/add-orders", (req, res) => {
    var deliveryDetails = req.body.deliveryDetails;
    var orders = deliveryDetails.orders;
    UserManager.getOnlineUsers(req.body.restaurant_uuid).then(info => {
        var restaurant_id = info.id;
        var query = "INSERT INTO orders(restaurant_id, customer_name, customer_address, customer_phone, items, delivery_fee) VALUES ?";
        var values = [];
        orders.map(order => {
            const {customerName, customerAddress, customerPhone, orderedItems, deliveryFee } = order;
            const items =  JSON.stringify(orderedItems);
            values.push([restaurant_id, customerName, customerAddress, customerPhone, items, deliveryFee]);
        })
        connection.query(query, [values], (err, resultForThisRequest) => {
            if(err) {console.log(err); res.json("failed");}
            else if(resultForThisRequest.affectedRows > 0){
                //{deliveryDetails:{restaurant:{name, address, geocode:{latitude, longitude}}
                // , orders:[{order:{id, customerInfo, items, estimatedDeliveryTime, deliveryFee}}]}}
                var insertedId = resultForThisRequest.insertId;
                orders.map(order => {
                    // add id (order_id)
                    order.id = insertedId;
                    insertedId++;
                })
                deliveryDetails.orders = orders;
                UserManager.addPendingOrder(deliveryDetails, false); // this is new order, never been rejected (false) by driver
                res.json(orders) // updated order ids for new inserted in client-side
            }
        })
    }).catch(err => console.log(err));
    
})

module.exports = router;
