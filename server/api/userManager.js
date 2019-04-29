const connection = require("./connector")
var googleMaps = require("@google/maps").createClient({
    key: "AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI",
    Promise: Promise,
})


class UserManager {
    constructor(){
        this.intervalToFindNearestDriver = setInterval(() => {
            // checking every second to findTheNearestDriver if there is a pending order
            if(this.pendingOrders.length > 0 && this.availableDrivers.length > 0){
                async function findTheNearestDriver (availableDrivers, pendingOrders, tobeNotifiedDrivers) {  
                    const deliveryDetails = pendingOrders.shift() ;// get order at first of queue

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
                                    (prev.duration_in_traffic.value < curr.duration_in_traffic.value) ? prev: current);
                        var uuid = nearestDriver.uuid;
                        // note for myself: nearestDriver can't be null
                        tobeNotifiedDrivers.push({uuid, deliveryDetails});
                    } else {
                        pendingOrders.unshift(deliveryDetails);
                        console.log("something wrong")
                    }
                  }
                findTheNearestDriver(this.availableDrivers, this.pendingOrders, this.tobeNotifiedDrivers);
            }
        },3000)

        // --- SERVER 
        this.users = [], // FOR ADMIN 
        // {uuid, id, address (restaurant.address || null)}
        this.onlineUsers = [],
        // --- DRIVER
        // element is id, as driver id; requested for location
        this.tobeRequestedLocation = [],
        // {id, driverLocation}
        //this.driverTrackerResponse = [{id: 5, driverLocation:{latitude: 37.531760, longitude: -122.027990}}],
        this.driverTrackerResponse = [],
	// {uuid, deliveryDetails:{restaurant:{name, address, geocode:{latitude, longitude}}, orders:[{order1, order2}]}} 
        // order1:{id, customerInfo, items, estimatedDeliveryTime}
        this.tobeNotifiedDrivers = [], // added from findClosestDriver
        /*    {
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
        ],*/ 
        // {uuid: 1, id: 2, location: {latitude: 1, longitude: 1}} as FIFO scheduling
        this.availableDrivers = [], //{
        /*    uuid: 1,
            id: 2,
            location: {latitude: 37.524270, longitude: -122.002150}
        }],*/
        // {uuid, deliveryDetails:{restaurant:{name, address}, orders:[{order1, order2}]}}
        this.deliveringDrivers = [],
        // --- RESTAURANT
        // {uuid, id, deliveryStatus} // id as order_id
        // deliveryStatus: 0:looking for driver, 1: delivering, 2: delivered
        this.tobeNotifiedRestaurants = [], //{
        /*        uuid: "5357462e-2345-58bb-9617-a72775f99607",
                id: 5,
                deliveryStatus: 1,
            },
            {
                uuid: "5357462e-2345-58bb-9617-a72775f99607",
                id: 6,
                deliveryStatus: 2,
            }
        ]*/
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
        this.deliveringDrivers.push(driver);
        // ---- persist data : update driver id to order driver_id
        this.getOnlineUsers(driver.uuid).then(res => {
            var driver_id = res.id;
            var orders = driver.deliveryDetails.orders;
            var query = "UPDATE orders SET driver_id=? WHERE id=?";
            var values = [driver_id, orders[0].id]
            if(orders.length > 1){
                query = "UPDATE orders SET driver_id=? WHERE id=? OR id=?";
                values.push(orders[1].id);
            }
            connection.query(query, values, (err) => {
                if(err) {console.log(err); throw err}
            })
        })
    }

    removeDeliveringDriver(driver){ // {uuid}
        this.deliveringDrivers.map((deliveringDriver, id) => {
            if(deliveringDriver.uuid === driver.uuid){
                this.deliveringDrivers.splice(id, 1);
            }
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
            // look for restaurant_uuid by using address, skipping validation for now
            var uuid = this.onlineUsers.filter(user => user.address === deliveryDetails.restaurant.address)[0].uuid;
            console.log("uuid " + uuid);
            this.tobeNotifiedRestaurants.push({
                uuid,
                id: order.id,
                deliveryStatus,
            })
            // ---- persist data: update order.deliveryStatus
            connection.query("UPDATE orders SET delivery_status=? WHERE id=?", [deliveryStatus, order.id], (err) => {
                if(err) {console.log(err); throw err}
            })
        })
    }


}

var instance = new UserManager();

module.exports = instance;
