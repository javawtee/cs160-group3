import uuid5 from "uuid/v5";
import PropTypes from "prop-types";

class Auth {
    login = (storeLocal, userInfo) => {
        const token = getToken(userInfo);
        sessionStorage.setItem("user-token", token); // token only exists if user logged in
        if(storeLocal)
            localStorage.setItem("user-token", token)
    }

    logout = () => {
        sessionStorage.removeItem("user-token");
        localStorage.removeItem("user-token");
    }

    isAuthenticated(){
        const localToken = localStorage.getItem("user-token");
        const token = sessionStorage.getItem("user-token");
        if(localToken === null && token === null) // != null ==> userToken exists
            return false;

        return true;
    }
}

function getToken(userInfo){
    const { userId, userName, userType, address, phoneNumber, email, approvedDate} = userInfo;
    const NAMESPACE = "45e669ee-e736-4354-9efc-e1d620b18c69"; // random UUID
    var aToken = JSON.stringify({
        uuid: uuid5(userName, NAMESPACE),
        userId,
        userName,
        userType,
        address,
        phoneNumber,
        email,
        approvedDate,
    }); // aToken is a JSON string
    return aToken;
}

export default new Auth()