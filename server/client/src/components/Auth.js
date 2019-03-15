class Auth {
    authenticated = false;

    login = (userName) => {
        this.authenticated = true;
        sessionStorage.setItem("user", userName)
    }

    isAuthenticated(){
        return this.authenticated;
    }
}

export default new Auth()