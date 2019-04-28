const express = require("express");
const router = express.Router();
var UserManager = require("./userManager");
var WebSocketServer = require("ws").Server;
var wss = new WebSocketServer({port: 5001});

// WEB SOCKET FOR DRIVER USERS
wss.on("connection", (ws) => {
    ws.on("message", (client) => {
        var metaData = JSON.parse(client);
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
            case "rejected":
                UserManager.addPendingOrder(metaData.deliveryDetails, true); // rejected: true => add order to top of the pending list
                break;
            case "accepted":
                UserManager.removeAvailableDriver(metaData.uuid);
                UserManager.addDeliveringDriver({uuid: metaData.uuid, deliveryDetails: metaData.deliveryDetails});
                UserManager.updateDeliveryStatus(metaData.deliveryDetails, 1); // 1: delivering
                break;
            case "delivered":
                UserManager.updateDeliveryStatus(metaData.deliveryDetails, 2); // 2: delivered; one order at a time
                break;
            case "here-your-location":
                var id = metaData.id;
                var driverLocation = metaData.driverLocation;
                UserManager.driverTrackerResponse.push({id, driverLocation});
            default:
                break;
        }
    })

    setInterval(() => {
       var orderRequests = UserManager.tobeNotifiedDrivers; 
       if(orderRequests.length > 0){
       // if there is an order request
       // broadcast to all clients/ available drivers, only client with exact uuid can receive request
        // order request is taken by FIFO
        var orderRequest = orderRequests.shift();
        ws.send(JSON.stringify(orderRequest));
       }
    }, 1000);

    setInterval(() => {
        if(UserManager.tobeRequestedLocation.length > 0){
            var request = tobeRequestedLocation.shift();
            var id = request.id;
            ws.send(JSON.stringify({message:"need-your-location", id})); // send to driver with exact order id
        }
    })
})

router.get("/test/notified", (req, res) => {
    res.send(UserManager.tobeNotifiedDrivers);
})

module.exports = router;