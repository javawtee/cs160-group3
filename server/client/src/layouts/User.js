import React, { Component } from 'react'
import {Link} from "react-router-dom";

const styles = {
  home: { border: "1px solid red", height: "250px" },
};

export class User extends Component {
  constructor(props){
    super(props);
    this.profile = React.createRef();
    this.console = React.createRef();
    this.history = React.createRef();
  }
  handleScrollTo = this.handleScrollTo.bind(this)

  handleScrollTo(e){
    e.preventDefault();
    const profile = this.profile.current;
    window.scrollTo({
      top: profile.offsetTop,
      left: 0,
      behavior: "instant"
    });
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
                    <Link className="nav-item" onClick={this.handleScrollTo} to="/main">
                        <div className="nav-link active">Console</div>
                    </Link>
                </li>
                <li>
                    <Link className="nav-item" onClick={this.handleScrollTo} to="/profile">
                        <div className="nav-link">
                            Profile
                        </div>
                    </Link>
                </li>
                <li>
                    <Link className="nav-item" onClick={this.handleScrollTo} to="/history">
                        <div className="nav-link">History</div>
                    </Link>
                </li>
                <li>
                  <Link className="nav-item" to="/logout">
                      <div className="nav-link">Logout</div>
                  </Link>
                </li>
            </ul>
            </div>
        </nav>
        <div className="container">
          <div className="row" style={styles.home} ref={this.console}>Console</div>
          <div className="row" style={styles.home} ref={this.profile}>
            <div className="col">
              Name: {JSON.parse(sessionStorage.getItem("user-token")).userName}
              <div>
                <a href="#">Change password</a>
              </div>
            </div>
            <div className="w-100"></div>
            <div className="col">
              Phone number, address, etc.
            </div>
          </div>
          <div className="row" ref={this.history}>History</div> {/*Bills, Payments*/}
        </div>
      </div>
    )
  }
}

export default User
