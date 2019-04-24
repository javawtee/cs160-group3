const connection = require("./connector")


class UserManager {
    constructor(){
        this.users = [],
        this.orders=[], // {orderDate, restaurant_id, customerName, customerAddress, customerPhone, items, driver_id, status}
        this.onlineUsers = [], // {uuid, id}
        this.availableDrivers = []
    }

    addOnlineUsers(user){ // user is a JSON with reference id (uuid), and id (users_id) that is only stored in back-end
        this.onlineUsers.push(user);
    }
    
    getOnlineUsers(uuid){
        return new Promise((resolve,reject) => {
            this.onlineUsers.map(user => {
                if(user.uuid === uuid){
                    return resolve(user.id);
                }
            })
            reject("no reference id like " + uuid + " exists");
        });
    }

    fetchListOfUsers(){
        return new Promise((resolve, reject) => {
            connection.query("SELECT * from users", (err, rows) => {
                if(err) reject(err);
                else {
                    this.users = rows
                    resolve(this.users)
                }
            })
        })
    }  
}

var instance = new UserManager();

module.exports = instance;