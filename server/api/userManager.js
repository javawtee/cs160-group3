const connection = require("./connector");
const fs = require("fs");
const corrupted = "./session/corrupted.json" // store sessions for current run of server, and used when server is restarted/ corrupted
var googleMaps = require("@google/maps").createClient({
    key: "AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI",
    Promise: Promise,
});

class UserManager {
    constructor(){
        this.findingNearestDriver = false;
        this.findNearestDriver = setInterval(() => {
            // checking every second to findTheNearestDriver if there is a pending order
            if(this.pendingOrders.length > 0 && this.availableDrivers.length > 0 && !this.findingNearestDriver){
                console.log("There are pending orders");
                const findTheNearestDriver = (availableDrivers, pendingOrders, tobeNotifiedDrivers , writeSession) => {
                    return new Promise(async (resolve, reject) => { 
                        const deliveryDetails = pendingOrders.shift();// get order at first of queue
                        if(deliveryDetails.restaurant === undefined) { 
                            return;
                        }

                        const promises = availableDrivers.map(async driver => {
                        var destination = deliveryDetails.restaurant.geocode; // restaurant's location
                        var uuid = driver.uuid;
                        var origin = driver.location; // driver's location
                        const promise = await googleMaps.distanceMatrix({
                                origins: [origin],
                                destinations: [destination],
                                mode: "driving",
                                departure_time: new Date(Date.now()),
                                traffic_model: "best_guess",
                                units: "imperial",
                                avoid: ["tolls", "highways"],
                            }).asPromise();
                    
                            return {
                                uuid,
                                duration_in_traffic :  promise.json.rows[0].elements[0].duration_in_traffic
                            }
                        })
                    
                        // wait until all promises resolve
                        // results = [{uuid, duration_in_traffic: {text: "3 mins", value: 152}}]
                        const results = await Promise.all(promises);
                    
                        // use the results
                        if(results.length > 0) {
                            var nearestDriver = results.reduce((prev, curr) => 
                                        (prev.duration_in_traffic.value < curr.duration_in_traffic.value) ? prev: curr);
                            var uuid = nearestDriver.uuid;
                            // note for myself: nearestDriver can't be null
                            console.log("Found the nearest or most available driver. Sending notification");
                            deliveryDetails.orders.remainingTime = 0;
                            deliveryDetails.orders.deliveryFee = ""; // driver won't see the fee
                            // temporarily remove driver who received order request
                            var rmDriverIndex = availableDrivers.findIndex(driver => driver.uuid === uuid);
                            availableDrivers.splice(rmDriverIndex, 1);
                            // notify the nearest driver
                            tobeNotifiedDrivers.push({uuid, deliveryDetails});
                            resolve(writeSession());
                        } else {
                            console.log("Something wrong. Return order to top of pendingOrders")
                            reject(pendingOrders.unshift(deliveryDetails));
                        }
                    })
                }   

                this.findingNearestDriver = true;  
                findTheNearestDriver(this.availableDrivers, this.pendingOrders, this.tobeNotifiedDrivers,() => this.writeSession())
                .then(() => this.findingNearestDriver = false);
            }
        }, 5000),

        // --- SERVER
        this.users = [], // FOR ADMIN
        // {sUuid, id, address (restaurant.address || null)}
        this.idReferences = [], 
        // {uuid, id, address (restaurant.address || null)}
        this.onlineUsers = [],
        // --- DRIVER
	    // {uuid, deliveryDetails:{restaurant:{name, address, geocode:{latitude, longitude}}, orders:[{order1, order2}]}} 
        // order1:{id, customerInfo, items, ETA} // deliveryFee in String, ETA in seconds
        this.tobeNotifiedDrivers = [
            // {
            //   uuid: "0f457377-b8b6-539b-8f56-2114155fab6e",
            //   deliveryDetails: {
            //     restaurant:{
            //         name:"a restaurant",
            //         address:"394 Blossom Hill Road, San Jose, California, Hoa Kỳ",
            //         geocode:{latitude:37.2513125, longitude:-121.827874 }
            //       },
            //       orders:[{
            //         customerName:"THONG HOANG LE",
            //         customerAddress:"600 Blossom Hill Road, San Jose, California, Hoa Kỳ",
            //         customerPhone:"4084428953",
            //         orderedItems:[{
            //           category:"Hot food",
            //           id:1,
            //           name:"Hot Food 1",
            //           price:"1.99",
            //           amount:"4"
            //         }],
            //         deliveryStatus:1,
            //         ETA:805,
            //         id:93
            //     }]
            //   }
            // }
        ], // added from findClosestDriver
        // {uuid: 1, id: 2, location: {latitude: 1, longitude: 1}} as FIFO scheduling
        this.availableDrivers = [],
        // {uuid, deliveryDetails:{restaurant:{name, address}, orders:[{order1, order2}]}}
        this.deliveringDrivers = [],
        // --- RESTAURANT
        // {uuid, id, deliveryStatus}
        // deliveryStatus: 0:looking for driver, 1: delivering, 2: delivered
        this.tobeNotifiedRestaurants = [
            // {
            //     uuid: "5357462e-2345-58bb-9617-a72775f99607",
            //     id: 93,
            //     driverLocation: {latitude: 37.2513125, longitude: -121.827874},
            //     deliveryStatus: 1
            // }
        ], 
        // {deliveryDetails:{restaurant:{name, address, , geocode:{latitude, longitude}}, orders:[{order1, order2}]}}
        this.pendingOrders = [
            // {
            //     restaurant:{name:"San Pedro Square Market",
            //                     address:"87 N San Pedro St, San Jose, CA 95110",
            //                         geocode:{latitude:37.3365,longitude:121.8943}},
            //     orders:[{customerName:"THONG HOANG LE",customerAddress:"2957 Bowery Lane",customerPhone:"4084428953",
            //             orderedItems:[{category:"Hot food",name:"Hot Food 1",price:"1.99",amount:"5"}], id:12}]
            // }
        ]
        
        this.loadSession = () => {
            fs.readFile(corrupted, "utf8", (err, data) => {
                //console.log("data: " + data);
                if(err) { 
                    console.log("ERR-loadSession" + err);
                    throw err; // stop server for now
                } else {
                    // data:{date, session:UserManagerInstance}
                    var lastSession = JSON.parse(data).session;
                    if(lastSession !== null){
                        const {
                            idReferences, availableDrivers, deliveringDrivers, 
                            tobeNotifiedDrivers, tobeNotifiedRestaurants, pendingOrders
                        } = lastSession;
                        this.idReferences = idReferences;
                        this.availableDrivers = availableDrivers;
                        this.deliveringDrivers = deliveringDrivers;
                        this.pendingOrders = pendingOrders;
                        this.tobeNotifiedRestaurants = tobeNotifiedRestaurants;
                        this.tobeNotifiedDrivers = tobeNotifiedDrivers;
                    }
                }
            })
        };

        this.loadSession();

        this.writeSession = () => {
            const {
                idReferences, availableDrivers, deliveringDrivers, 
                pendingOrders, tobeNotifiedRestaurants, tobeNotifiedDrivers
            } = this;
            const session = {
                idReferences, availableDrivers, deliveringDrivers, 
                pendingOrders, tobeNotifiedRestaurants, tobeNotifiedDrivers
            };
            fs.writeFile(corrupted, JSON.stringify({date:new Date(), session}), err => {
                if(err) console.log("ERR-writeSession: " + err);
            })
        }
    }

    // ---- ADMIN
    fetchListOfUsers(){
        return new Promise((resolve, reject) => {
            connection.query("SELECT * from users", (err, rows) => {
                if(err) {console.log(err); reject(err);}
                else {
                    this.users = rows
                    resolve(this.users)
                }
            })
        })
    } 

    // ---- SERVER
    addIdReference(user){ // user is a JSON with super reference id (sSuid), users_id (id)
        var exists = this.idReferences.findIndex(ref => ref.sUuid === user.sUuid) > -1 ;
        if(!exists){
            this.idReferences.push(user);
            // store it to local in case server is down, losing all user's session
            this.writeSession();
        }
    }

    addOnlineUsers(user){ // user is a JSON with reference id (uuid), users_id (id), and address (restaurant.address || null)
        var exists = this.onlineUsers.findIndex(onlineUser => onlineUser.uuid === user.uuid) > -1 ;
        if(!exists){
            this.onlineUsers.push(user);
            // store it to local in case server is down, losing all user's session
            // NO. when server is down and restarts, kick all the users on session
        }
    }

    removeOnlineUser(uuid){
        return new Promise((resolve, reject) => {
            var exists = this.onlineUsers.findIndex(user => user.uuid === uuid) > -1;
            if(exists){
                var rmIndex = this.onlineUsers.findIndex(user => user.uuid === uuid);
                this.onlineUsers.splice(rmIndex, 1);
                resolve("Removed");
            } else reject("User is not found or removed");
        })    
    }
    
    getOnlineUsers(uuid){
        return new Promise((resolve,reject) => {
            var userIndex = this.onlineUsers.findIndex(user => user.uuid === uuid);
            if(userIndex > -1){
                var user = this.onlineUsers[userIndex];
                var id = user.id;
                var address = user.address; // restaurant.address || null
                return resolve({id, address});
            }
            return reject("no reference id like " + uuid + " exists");
        });
    }

    onSession(uuid){
        // prevent user from logging multiple times
        return new Promise((resolve,reject) => {
            this.getOnlineUsers(uuid)
            .then(() => reject()) // user is found on server session
            .catch(() => resolve()) // user is not found on server session 
        })
    }

    // ---- DRIVER
    addAvailableDriver(driver){
        console.log("A driver becomes available");
        if(this.availableDrivers.findIndex(availableDriver => availableDriver.uuid === driver.uuid) < 0){
            this.availableDrivers.push(driver); // new driver will be added to the end of the "queue"
            this.writeSession();
        }
    }

    removeAvailableDriver(uuid){
        console.log("A driver becomes unavailable");
        var rmIndex = this.availableDrivers.findIndex(driver => driver.uuid === uuid);
        this.availableDrivers.splice(rmIndex, 1);
        this.writeSession();
    }

    addDeliveringDriver(driver){ // driver = {uuid, deliveryDetails:{restaurant:{name, address}, orders:[{order1, order2}]}}
        console.log("A driver starts a delivery");
        this.deliveringDrivers.push(driver);
        this.writeSession();
        // ---- persist data : update driver id to order driver_id
        this.getOnlineUsers(driver.uuid).then(res => {
            var driver_id = res.id;
            driver.deliveryDetails.orders.forEach(order => {
                connection.query("UPDATE orders SET driver_id=? WHERE id=?", [driver_id, order.id], (err) => {
                    if(err) {console.log(err); throw err}
                })
            })
        })
    }
    removeDeliveringDriver(uuid){
        console.log("A driver completed a delivery");
        var rmIndex = this.deliveringDrivers.findIndex(driver => driver.uuid === uuid);
        this.deliveringDrivers.splice(rmIndex, 1);
        this.writeSession();
    }

    getDeliveringDriver(uuid){
        var index = this.deliveringDrivers.findIndex(driver => driver.uuid === uuid);
        return this.deliveringDrivers[index];
    }

    // ---- RESTAURANT
    addPendingOrder(deliveryDetails, rejected){ // orders as an array of 1 or 2 elements/orders
        console.log("Adding to PendingOrders");
        if(rejected){
            // rejected by driver, add to first of queue to prevent from starving
            this.pendingOrders.unshift(deliveryDetails);
            this.writeSession();
        } else {
            // new order(s) from a restaurant, get in queue
            this.pendingOrders.push(deliveryDetails);
            this.writeSession();
        }
    } 

    updateDeliveryStatus(deliveryDetails, deliveryStatus, driverLocation){ // deliveryDetails.map() is used when driver accepted 2 orders
        deliveryDetails.orders.map(order => {
            // look for restaurant_uuid by using address
            var index = this.onlineUsers.findIndex(user => user.address === deliveryDetails.restaurant.address);
            if(index > -1){
                // restaurant is online, sending real-time update
                var uuid = this.onlineUsers[index].uuid;
                this.tobeNotifiedRestaurants.push({
                    uuid,
                    id: order.id,
                    driverLocation,
                    deliveryStatus,
                })
            }
            // ---- persist data: update order.deliveryStatus
            connection.query("UPDATE orders SET delivery_status=?, driver_location=? WHERE id=?", 
                [deliveryStatus, JSON.stringify(driverLocation), order.id], 
                    (err) => { if(err) {console.log(err); throw err }
                }
            )
        })
    }
}

var instance = new UserManager();

module.exports = instance;
