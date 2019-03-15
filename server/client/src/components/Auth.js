import uuid5 from "uuid/v5";
import PropTypes from "prop-types";

class Auth {
    userName = null;
    login = (userName) => {
        this.userName = userName;
        sessionStorage.setItem("user-token", getToken(userName)); // token only exists if user logged in
    }

    checkAuth(){
        const token = sessionStorage.getItem("user-token");
        if(token === null) // != null ==> userToken exists
            return false;

        return true;
    }

    isAuthenticated(){
        return sessionStorage.getItem("user-session") !== this.userToken;
    }
}

function getToken(userName){
    const NAMESPACE = "45e669ee-e736-4354-9efc-e1d620b18c69"; // random UUID
    var aToken = JSON.stringify({uuid: uuid5(userName, NAMESPACE)}); // aToken is a JSON string
    return aToken;
}

export default new Auth()