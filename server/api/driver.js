const express = require("express");
const router = express.Router();
const connection = require("./connector");
var UserManager = require("./userManager");
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port: 5001});

// WEB SOCKET FOR DRIVER USERS
setInterval(() => {
    var orderRequests = UserManager.tobeNotifiedDrivers;
    if(orderRequests.length > 0){
        // if there is an order's delivery update
        // broadcast to all clients/ connected restaurant, only client with exact uuid can receive request
        if(wss.clients.size > 0){
            console.log("fetching update, # of driver clients: " + wss.clients.size )
            // loop through orderRequests to prevent losing request for client who might be disconnected
            orderRequests.forEach(request => {
                wss.clients.forEach(function each(client) {
                    if (client.readyState === 1) {
                        client.send(JSON.stringify({message:"order-request", request}));
                    }
                });
            }) 
        }
    }
 }, 5000);

wss.on("connection", (ws,protocols) => {
    // get protocol parameter, see api/WS-IncomingMessage
    var uuid = protocols.rawHeaders[protocols.rawHeaders.length - 1];
    UserManager.onSession(uuid)
    .then(() => {
        // not found on server session, start writing session for this user
        var sUuid = uuid + "server";
        var refIndex = UserManager.idReferences.findIndex(ref => ref.sUuid === sUuid);
        if(refIndex > -1){
            // user has logged in => id, address in idReferences exists
            var id = UserManager.idReferences[refIndex].id;
            var address = UserManager.idReferences[refIndex].address;
            UserManager.addOnlineUsers({uuid, id, address}); // add user session
            console.log("[CONNECT] a driver has recently joined, id = " + uuid);
            ws.on("message", (client) => {
                var metaData = JSON.parse(client);
                console.log("Driver action: " + metaData.action);
                switch(metaData.action){
                    case "start":
                        // get id by using uuid
                        var newDriver = {
                            uuid: metaData.uuid,
                            id: 2,
                            location: metaData.location, 
                        };
                        UserManager.addAvailableDriver(newDriver); // if driver starts from a "DELIVERING", remove driver from deliveringDrivers
                        break;
                    case "stop":
                        UserManager.removeAvailableDriver(metaData.uuid);
                        break;
                    case "received-request":
                        console.log("A request received");
                        var requests = UserManager.tobeNotifiedDrivers;
                        var rmRequestIndex = requests.findIndex(request => request.uuid === metaData.uuid);
                        requests.splice(rmRequestIndex, 1);
                        UserManager.writeSession();
                        break;
                    case "rejected":
                         var driver = metaData.driver;
                         UserManager.getOnlineUsers(driver.uuid).then(res => {
                            driver.id = res.id;  // metaData as driver
                            // the driver becomes available again
                            UserManager.addAvailableDriver(driver);
                            UserManager.addPendingOrder(metaData.deliveryDetails, true); // rejected: true => add order to top of the pending list
                         })
                        break;
                    case "accepted":
                        UserManager.removeAvailableDriver(metaData.uuid);
                        UserManager.addDeliveringDriver({uuid: metaData.uuid, deliveryDetails: metaData.deliveryDetails});
                        UserManager.updateDeliveryStatus(metaData.deliveryDetails, 1, metaData.driverLocation); // 1: delivering
                        break;
                    case "delivered":
                        UserManager.updateDeliveryStatus(metaData.deliveryDetails, 2, null); // 2: delivered; one order at a time
                        break;
                    case "finished-delivery":
                        UserManager.removeDeliveringDriver(metaData.uuid); // finished all deliveries
                        break;
                    default:
                        break;
                }
            })
        
            ws.on("close", () => {
                console.log("[DISCONNECT] a driver has just left, id = " + uuid);
                // remove user session, will print "User is not found" because if logging out, user session had been removed before
                UserManager.removeOnlineUser(uuid).catch(err => console.log(err)); 
            })
        } else {
            // else send default initialization of data
            res.json(payload);
        }
    }).catch(() => {
        // found on server session
        ws.close();
    })
})

router.post("/fetch-request", (req, res) => {
    var index = UserManager.deliveringDrivers.findIndex(driver => driver.uuid === req.body.uuid);
    if(index > -1){
        var request = UserManager.deliveringDrivers[index];
        res.json({message:"fetched", request});
    } else {
        res.json({message:"failed"});
    }
})

router.post("/history", (req, res) => {
    UserManager.getOnlineUsers(req.body.uuid).then(info => {
        connection.query(`SELECT users.userName as restaurantName, orders.order_date as orderDate, restaurant.address as restaurantAddress
                            FROM orders, restaurant, users
                            WHERE 
                            orders.driver_id=${info.id} AND orders.delivery_status = 2 AND
                            orders.restaurant_id = restaurant.restaurantId AND restaurant.users_id = users.id
                            ORDER BY orders.order_date DESC`, (err,rows) => {
                if(err) {console.log(err);res.json(err)}
                else {
                    if(rows.length > 0){
                        res.json({message:"success", rows});
                    } else {
                        res.json({message:"no-result"})
                    }
                }
        })
    }).catch(err => {console.log(err); res.json("error")}) // error: no restaurant is found with uuid
})

module.exports = router;