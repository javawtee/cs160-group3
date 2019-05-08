class Auth {
    login = (storeLocal, userInfo) => {
        const token = getToken(userInfo);
        sessionStorage.setItem("user-token", JSON.stringify(token)); // token only exists if user logged in
        if(storeLocal){
            token.expiration = (new Date()).getTime() + (30 * 60000); // expired localStorage in 30 minutes
        } else {
            token.expiration = (new Date()).getTime() + (10080 * 60000); // expired localStorage in 7 days = 10080 minutes
        }
        localStorage.setItem("user-token", JSON.stringify(token));
    }

    logout = () => {
        sessionStorage.removeItem("user-token");
        localStorage.removeItem("user-token");
    }

    isAuthenticated(){
        var token = localStorage.getItem("user-token");
        if(token !== null) {
            token = JSON.parse(token);
            console.log(token)
            if(token.uuid && token.uuid !== ""){
                // valid token
                // check whether user is login
                var uuid = token.uuid;
                console.log(uuid);
                console.log(sessionStorage.getItem("user-token"));
                if(sessionStorage.getItem("user-token")){
                    console.log("prevent logging out when user refreshes the page");
                    return true;
                }
                
                fetch("/user/is-logged", {
                    method: "POST",
                    headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                    },
                    body: JSON.stringify({uuid})
                }).then(res => res.json())
                .then(message => {
                    console.log(message);
                    if(message === "on-session"){
                        alert("ALERT! Multiple Access");
                        window.location.href = "/";
                        return false;
                    } else {
                        // is not on server session
                        localStorage.setItem("user-token", JSON.stringify(token));
                        if(token.expiration - (new Date()).getTime() <= 0){
                            alert("Your token is expired. Please log-in again");
                            // token is expired, require new token
                            // force to logout => remove localStorage
                            this.logout();
                            return false;
                        }
                        delete token.expiration; // sessionStorage doesn't need this
                        sessionStorage.setItem("user-token", JSON.stringify(token));
                        return true;
                    }
                })
            } else {
                // invalid token
                console.log("Invalid token. Forced to logout")
                this.logout();
                return false;
            }
        }
        return false;
    }
}

function getToken(userInfo){
    const { uuid, userName, userType, address, phoneNumber, email, approvedDate} = userInfo;
    var aToken = {
        uuid,
        userName,
        userType,
        address,
        phoneNumber,
        email,
        approvedDate, // joined date
    }; 
    if(userType === "driver"){ // used with START/STOP button
        aToken.started = false;
        aToken.delivering = false;
    }
    return aToken; // aToken is a JSON string
}

export default new Auth()