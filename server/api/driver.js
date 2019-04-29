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
            case "rejected":
                 // the driver becomse available again
                 var driver = metaData.driver;
                 UserManager.getOnlineUsers(driver.uuid).then(res => {
                    driver.id = res.id;  // metaData as driver
                    UserManager.addAvailableDriver(driver);
                    UserManager.addPendingOrder(metaData.deliveryDetails, true); // rejected: true => add order to top of the pending list
                 })
                break;
            case "accepted":
                UserManager.addDeliveringDriver({uuid: metaData.uuid, deliveryDetails: metaData.deliveryDetails});
                UserManager.updateDeliveryStatus(metaData.deliveryDetails, 1); // 1: delivering
                break;
            case "delivered":
                UserManager.updateDeliveryStatus(metaData.deliveryDetails, 2); // 2: delivered; one order at a time
                break;
            case "finished-delivery":
                UserManager.removeDeliveringDriver({uuid: metaData.uuid})
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
        // temporarily remove driver who received order request
        UserManager.removeAvailableDriver(orderRequest.uuid); 
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

router.get("/test/notified", res => {
    res.send(UserManager.tobeNotifiedDrivers);
})

router.get("/test/available", res => {
    res.send(UserManager.availableDrivers);
})

router.get("/test/delivering", res => {
    res.send(UserManager.deliveringDrivers);
})

module.exports = router;