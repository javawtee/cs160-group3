import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Auth from "../components/Auth";
import DriverConsole from "./console/DriverConsole";
import RestaurantConsole from "./console/RestaurantConsole";

const styles = {
  home: { border: "1px solid red"},
};

export class User extends Component {
  constructor(props){
    super(props);
    this.state ={
      changePassword: false,
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }
    this.profile = React.createRef();
    this.console = React.createRef();
    this.history = React.createRef();
  }
  handleScrollTo = this.handleScrollTo.bind(this);
  toggleChangePassword = this.toggleChangePassword.bind(this);
  handleChangePassword = this.handleChangePassword.bind(this);

  handleScrollTo(e){
    e.preventDefault();
    var toRef = null;
    switch(e.currentTarget.id){
      case "console":
        toRef = this.console.current;
        break;
      case "profile":
        toRef = this.profile.current;
        break;
      case "history":
        toRef = this.history.current;
        break;
      default:
        toRef = null;
        break;
    }
    window.scrollTo({
      top: toRef.offsetTop,
      left: 0,
      behavior: "auto"
    });
  }

  handleLogOut(e){
    e.preventDefault();
    Auth.logout();
    window.location.href="/";
  }

  toggleChangePassword(e){
    e.preventDefault();
    this.setState((prevState) => ({
      changePassword: !prevState.changePassword,
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }))
  }

  handleOnChangePasswordInputs = (e) => {
    this.setState({[e.target.name]: e.target.value})
  }

  handleChangePassword(e){
    e.preventDefault();
    alert("updated");
    this.setState((prevState) => ({
      changePassword: !prevState.changePassword,
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    }))
  }
  render() {
    const { userName, userType, address, phoneNumber, email, approvedDate} = JSON.parse(sessionStorage.getItem("user-token"));
    return (
      <div>
          <nav className="navbar navbar-expand-md navbar-dark bg-dark" ref="navBar" >
            <button className="navbar-toggler" type="button" 
                    data-toggle="collapse" data-target="#navbarSupportedContent" 
                    aria-controls="navbarSupportedContent" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation">
            <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
                <li>
                    <Link className="nav-item" id="console" onClick={this.handleScrollTo} to="/main">
                        <div className="nav-link active">Console</div>
                    </Link>
                </li>
                <li>
                    <Link className="nav-item" id="profile" onClick={this.handleScrollTo} to="/profile">
                        <div className="nav-link">
                            Profile
                        </div>
                    </Link>
                </li>
                <li>
                    <Link className="nav-item" id="history" onClick={this.handleScrollTo} to="/history">
                        <div className="nav-link">History</div>
                    </Link>
                </li>
                <li>
                  <Link className="nav-item" onClick={this.handleLogOut} to="/logout">
                      <div className="nav-link">Logout</div>
                  </Link>
                </li>
            </ul>
            </div>
        </nav>
        <div className="container">
          <div className="row" style={styles.home} ref={this.console}>
            {userType === "driver" ? <DriverConsole /> : <RestaurantConsole />}
          </div>
          <div className="row" style={styles.home} ref={this.profile}>
            <div className="col">
              Name: {userName}
              <div>
                <a href="user/changePassword" onClick={this.toggleChangePassword}>Change password</a>
                <div style={{display: this.state.changePassword? "block": "none"}}>
                  <label>Old password:</label><br/>
                  <input type="password" name="oldPassword" value={this.state.oldPassword}
                          onChange={this.handleOnChangePasswordInputs}/><br/>
                  <label>New password:</label><br/>
                  <input type="password" name="newPassword" value={this.state.newPassword}
                          onChange={this.handleOnChangePasswordInputs}/><br/>
                  <label>Confirm new password:</label><br/>
                  <input type="password" name="confirmNewPassword" value={this.state.confirmNewPassword}
                          onChange={this.handleOnChangePasswordInputs}/><br/>
                  <button onClick={this.handleChangePassword}>Update</button>
                </div>
              </div>
            </div>
            <div className="w-100"></div>
            <div className="col">
              Joined date: {approvedDate} <br/>
              Phone number: {phoneNumber} <br/>
              Email: {email} <br/>
              {address !== null ? "Address: " + address : ""}
            </div>
          </div>
          <div className="row" style={styles.home} ref={this.history}>History</div> {/*Bills, Payments*/}
        </div>
      </div>
    )
  }
}

export default User
