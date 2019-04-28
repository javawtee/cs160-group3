const connection = require("./connector")
var googleMaps = require("@google/maps").createClient({
    key: "AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI",
})


class UserManager {
    constructor(){
        this.findNearestDriver = setInterval(() => {
            // checking every second to findTheNearestDriver if there is a pending order
            if(this.pendingOrders.length > 0){
               var deliveryDetails = this.pendingOrders.shift(); // get order at first of queue 
               var destination = deliveryDetails.restaurant.geocode; // restaurant's location 
               var temp = []; // duration_in_traffic: {text: "3 mins", value: 152}
               this.availableDrivers.map(availableDriver => {
                    var uuid = availableDriver.uuid;
                    var origin = availableDriver.location; // driver's location
                    googleMaps.distanceMatrix({
                        origins: [origin],
                        destinations: [destination],
                        mode: "driving",
                        departure_time: new Date(Date.now()),
			            traffic_model: "best_guess",
                        units: "imperial",
                        avoid: ["tolls", "highways"],
                    }, (err, res) => {
                        if (!err) {
                            var duration_in_traffic =  res.json.rows[0].elements.duration_in_traffic;
                            temp.push({uuid, duration_in_traffic});
                        }
                    })
                })
                var nearestDriver = temp.reduce((prev, curr) => 
                                (prev.duration_in_traffic.value > curr.duration_in_traffic.value) ? prev: current, 1); // 1: prevent array is empty
                if(nearestDriver !== null){
                   this.tobeNotifiedDrivers.push(nearestDriver);
                } else {
                   // no driver found => return to first of queue
                   this.pendingOrders.unshift(deliveryDetails);
                }
            }
        },1000)

        // --- SERVER
        this.users = [], // FOR ADMIN 
        // {uuid, id, address (restaurant.address || null)}
        this.onlineUsers = [],
        // --- DRIVER
        // element is id, as driver id; requested for location
        this.tobeRequestedLocation = [],
        // {id, driverLocation}
        this.driverTrackerResponse = [{id: 5, driverLocation:{latitude: 37.531760, longitude: -122.027990}}],
        // {uuid, deliveryDetails:{restaurant:{name, address, geocode:{latitude, longitude}}, orders:[{order1, order2}]}} 
        // order1:{id, customerInfo, items, estimatedDeliveryTime}
        this.tobeNotifiedDrivers = [ // added from findClosestDriver
            {
                uuid: "0f457377-b8b6-539b-8f56-2114155fab6e",
                deliveryDetails: {
                    restaurant:{
                        name: "Restaurant A",
                        address: "123 XYZ, SJ, CA 11111",
                    },
                    orders: [
                    { 
                        id: 1,
                        customerName: "Customer X",
                        customerAddress: "123 XYZ, SJ, CA 11111",
                        customerPhone: "1112223333",
                        estimatedDeliveryTime: 1000 * 3 * 60,
                        // items
                    },
                    {
                        id: 2,
                        customerName: "Customer Y",
                        customerAddress: "123 XYZ, SJ, CA 11111",
                        customerPhone: "1112223334",
                        estimatedDeliveryTime: 1000 * 2 * 60,
                        // items
                    }
                    ],
                },
            }
        ], 
        // {uuid: 1, id: 2, location: {latitude: 1, longitude: 1}} as FIFO scheduling
        this.availableDrivers = [{
            uuid: 1,
            id: 2,
            location: {latitude: 37.524270, longitude: -122.002150}
        }],
        // {uuid, deliveryDetails:{restaurant:{name, address}, orders:[{order1, order2}]}}
        this.deliveringDrivers = [],
        // --- RESTAURANT
        // {uuid, id, deliveryStatus}
        // deliveryStatus: 0:looking for driver, 1: delivering, 2: delivered
        this.tobeNotifiedRestaurants = [{
                uuid: "5357462e-2345-58bb-9617-a72775f99607",
                id: 5,
                deliveryStatus: 1,
            },
            {
                uuid: "5357462e-2345-58bb-9617-a72775f99607",
                id: 6,
                deliveryStatus: 2,
            }
        ]
        // {deliveryDetails:{restaurant:{name, address, , geocode:{latitude, longitude}}, orders:[{order1, order2}]}}
        this.pendingOrders = [
            {
                restaurant:{name:"a restaurant",
                                address:"39131 cedar blvd, newark, 94560",
                                    geocode:{"latitude":37.523262,"longitude":-122.006422}},
                orders:[{customerName:"THONG HOANG LE",customerAddress:"2957 Bowery Lane",customerPhone:"4084428953",
                        orderedItems:[{category:"Hot food",id:1,name:"Hot Food 1",price:"1.99",amount:"5"}],id:0}]
            }
        ]
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
    addOnlineUsers(user){ // user is a JSON with reference id (uuid), and users_id (id)
        this.onlineUsers.push(user);
    }
    
    getOnlineUsers(uuid){
        return new Promise((resolve,reject) => {
            this.onlineUsers.map(user => {
                if(user.uuid === uuid){
                    var id = user.id;
                    var address = user.address; // restaurant.address || null
                    return resolve({id, address});
                }
            })
            reject("no reference id like " + uuid + " exists");
        });
    }

    // ---- DRIVER
    addAvailableDriver(newDriver){
        // check if driver is in deliveringDrivers, when driver becomes available, he would be taken out from there
        // newDriver known as a driver who just finished a delivery request (1 or 2 orders)
        var driverInDeliveryIndex = this.deliveringDrivers.indexOf(deliveringDriver => deliveringDriver.uuid === newDriver.uuid);
        if(driverInDeliveryIndex > -1){
            this.deliveringDrivers.splice(driverInDeliveryIndex, 1);
        }
        // check if driver is already available
        if(this.availableDrivers.filter(availableDriver => availableDriver.uuid === newDriver.uuid).length === 0){
            this.availableDrivers.push(newDriver); // new driver will be added to the end of the "queue"
        }
    }

    removeAvailableDriver(rmDriverUUID){
        this.availableDrivers.map((availableDriver,id) => {
            if(availableDriver.uuid === rmDriverUUID){
                this.availableDrivers.splice(id, 1);
            }
        })
    }

    addDeliveringDriver(driver){ // driver = {uuid, deliveryDetails:{restaurant:{name, address}, orders:[{order1, order2}]}}
        // ---- persist data : update driver id to order driver_id
        this.getOnlineUsers(driver.uuid).then(res => {
            var driver_id = res.id;
            var orders = driver.deliveryDetails.orders;
            var query = `UPDATE orders SET driver_id=? WHERE id=?`
            query.concat(orders.length === 1 ? `` : ` OR id=?`)
            values = [driver_id, orders[0].id]
            values = orders.length > 1 ? values.push(orders[1].id) : values;
            connection.query(query, [value], (err) => {
                if(err) {console.log(err); throw err}
                else {
                    this.deliveringDrivers.push(driver);
                }
            })
        })
    }

    // ---- RESTAURANT
    addPendingOrder(deliveryDetails, rejected){ // orders as an array of 1 or 2 elements/orders
        if(rejected){
            // rejected by driver, add to first of queue to prevent from starving
            this.pendingOrders.unshift(deliveryDetails);
        } else {
            // new order(s) from a restaurant, get in queue
            this.pendingOrders.push(deliveryDetails);
        }
    } 

    updateDeliveryStatus(deliveryDetails, deliveryStatus){ // deliveryDetails.map() is used when driver accepted 2 orders
        deliveryDetails.orders.map(order => {
            // ---- persist data: update order.deliveryStatus
            var orders = driver.deliveryDetails.orders;
            var query = `UPDATE orders SET delivery_status=? WHERE id=?`
            query.concat(orders.length === 1 ? `` : ` OR id=?`)
            values = [deliveryStatus, orders[0].id]
            values = orders.length > 1 ? values.push(orders[1].id) : values;
            connection.query(query, [values], (err) => {
                if(err) {console.log(err); throw err}
                else {
                    // look for restaurant_uuid by using address, skipping validation for now
                    var uuid = this.onlineUsers.filter(user => user.address === deliveryDetails.restaurant.address)[0];
                    this.tobeNotifiedRestaurants.push({
                        uuid,
                        orderId: order.id,
                        deliveryStatus,
                    })
                }
            })
        })
    }


}

var instance = new UserManager();

module.exports = instance;