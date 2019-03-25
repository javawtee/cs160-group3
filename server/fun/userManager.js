const connection = require("../api/connector")

class UserManager {
    constructor(){
        this.users = []
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

module.exports = new UserManager()