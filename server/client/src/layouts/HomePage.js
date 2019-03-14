import React, { Component } from 'react';
import {Link} from "react-router-dom";

import LoginForm from "./forms/LoginForm";
import SignUp from "./SignUp";

export class HomePage extends Component {
    constructor(props){
        super(props);
        this.state = {
            currentContent: "",
            navBarHeight: 0,
        }
    }

    componentWillMount(){
        this.setState({currentContent:this.props.content})
    }
    
    componentDidMount(){
        this.setState({navBarHeight: this.refs.navBar.clientHeight});
        
    }

    getContent(){
        switch(this.state.currentContent){
            case "login":
                return <LoginForm />;
            case "signUp":
                return <SignUp />;
            default:
                return <div>broken</div>
        }
    }

  render() {
      const {currentContent, navBarHeight} = this.state;
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
                    <Link className={currentContent === "login" ? "nav-item active" : "nav-item"} to="/">
                        <div className="nav-link">
                            Login
                        </div>
                    </Link>
                </li>
                <li>
                    <Link className={currentContent === "signUp" ? "nav-item active" : "nav-item"} to="/signUp">
                        <div className="nav-link">Sign up</div>
                    </Link>
                </li>
            </ul>
            </div>
        </nav>
        <div className="form-container container container-expand-md"
                style={{minHeight: "calc(100vh - " + navBarHeight + "px)"}}>
            <div className="row">
                <div className="form-col col">
                    {this.getContent()}
                </div>
            </div>
        </div>
      </div>
    )
  }
}

export default HomePage
