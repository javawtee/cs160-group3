import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Auth from "../components/Auth";
import DriverConsole from "./console/DriverConsole";
import RestaurantConsole from "./console/RestaurantConsole";
import UserInformation from "./forms/UserInformation";

const styles = {
  home: { border: "1px solid red"},
};

export class User extends Component {
  handleLogOut(e){
    e.preventDefault();
    Auth.logout();
    window.location.href="/";
  }
  
  render() {
    const userType = JSON.parse(sessionStorage.getItem("user-token")).userType;
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
                  <Link className="nav-item" onClick={this.handleLogOut} to="/logout">
                      <div className="nav-link">Logout</div>
                  </Link>
                </li>
            </ul>
            </div>
        </nav>
        <div className="container">
          <div className="row" style={styles.home}>
            {userType === "driver" ? <DriverConsole /> : <RestaurantConsole />}
          </div>
          <div className="row" style={styles.home}>
            <UserInformation />
          </div>
          <div className="row" style={styles.home}>History</div> {/*Bills, Payments*/}
        </div>
      </div>
    )
  }
}

export default User
