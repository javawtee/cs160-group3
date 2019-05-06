const express = require("express");
const router = express.Router();
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
 }, 3000);

wss.on("connection", ws => {
    var clientId = wss.clients.size -1;
    console.log("[CONNECT] a driver has recently joined, id = " + clientId);
    ws.on("message", (client) => {
        var metaData = JSON.parse(client);
        console.log("Driver action: " + metaData.action);
        switch(metaData.action){
            case "start":
                UserManager.getOnlineUsers(metaData.uuid).then(res => {
                    var newDriver = {
                        uuid: metaData.uuid,
                        id: res.id,
                        location: metaData.location, 
                    };
                    UserManager.addAvailableDriver(newDriver); // if driver starts from a "DELIVERING", remove driver from deliveringDrivers
                })
                break;
            case "stop":
                UserManager.removeAvailableDriver(metaData.uuid);
                break;
            case "received-request":
                console.log("A request received");
                var requests = UserManager.tobeNotifiedDrivers;
                var rmRequestIndex = requests.findIndex(request => request.uuid === metaData.uuid);
                requests.splice(rmRequestIndex, 1);
                // don't have to writeSession here since removeAvailableDriver will have it
                // temporarily remove driver who received order request
                UserManager.removeAvailableDriver(metaData.uuid);  // writeSession within
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
        console.log("[DISCONNECT] a driver has just left, id = " + clientId);
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

module.exports = router;