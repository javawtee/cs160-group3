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
    const { uuid, userName, userType, address, phoneNumber, email, approvedDate} = userInfo;
    var aToken = JSON.stringify({
        uuid,
        userName,
        userType,
        address:"null",
        phoneNumber,
        email,
        approvedDate, // joined date
    }); // aToken is a JSON string
    return aToken;
}

export default new Auth()