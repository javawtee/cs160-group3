import React, { Component } from 'react'
import {Link} from "react-router-dom";
import Auth from "../components/Auth";
import DriverConsole from "./console/DriverConsole";
import RestaurantConsole from "./console/RestaurantConsole";
import UserInformation from "./forms/UserInformation";
import History from "./History";
import RestaurantOverview from "./dialog/RestaurantOverview";

export class User extends Component {
  state = {
    userType: JSON.parse(sessionStorage.getItem("user-token")).userType,
    openRestaurantOverview: false,
    history:[],
  };

  openRestaurantOverview = () => {
    this.setState({openRestaurantOverview: true});
  }

  closeRestaurantOverview = () => {
    this.setState({openRestaurantOverview: false});
  }

  handleLogOut(e){
    e.preventDefault();
    var session = JSON.parse(sessionStorage.getItem("user-token"));
    var uuid = session.uuid;
    if(session.delivering && session.delivering === true){
      alert("Please finish your delivery before logging out");
      return;
    }
    if(session.started && session.started === true){
      alert("Please click STOP before logging out");
      return;
    }
    fetch("/user/logout", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({uuid})
    }).then(res => res.json())
    .then(msg => {
      if(msg === "Removed"){
        console.log("logging out")
        Auth.logout();
        window.location.href="/";
      }
    }).catch(() => {
      // force to logout
      Auth.logout();
      window.location.href="/";
    })
  }

  componentWillMount = () => {
    var userType = this.state.userType;
    var url = userType === "driver" ? "/driver/history" : "/restaurant/history";
    var uuid = JSON.parse(sessionStorage.getItem("user-token")).uuid;
    fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({userType, uuid})
    }).then(res => res.json())
    .then(resp => {
      if(resp.message === "success"){
        this.setState({history: resp.rows});
      } else {
        // no result
        console.log("failed to load history")
      }
    }).catch(msg => {
      if(msg === "error"){
        // force to logout
        alert("Web Server can't authorize you. Please log-in again. Sorry for the inconvenience");
        Auth.logout();
        window.location.href="/";
      }
    })
  }

  sendToHistory = past => {
    var history = this.state.history;
    history.unshift(past);
    this.setState({history});
  }
  
  render() {
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
          <div className="row p-1">
            {this.state.userType === "driver" ? <DriverConsole sendToHistory={this.sendToHistory} /> : <RestaurantConsole sendToHistory={this.sendToHistory}/>}
          </div>
          <div className="row p-1" style={{background:"#243f6b", color:"#fff"}}>
            <div>
              <button className="btn btn-primary ml-3 mb-3 mt-3" style={{display: this.state.userType === "driver"? "none":""}}
                        onClick={this.openRestaurantOverview}>
                Preview profile
              </button>
            </div>
            <UserInformation />
          </div>
          <div className="row p-1">
            <History list={this.state.history}/>
          </div>
        </div>
        <RestaurantOverview open={this.state.openRestaurantOverview} onClose={this.closeRestaurantOverview} />
      </div>
    )
  }
}

export default User
