import React, { Component } from 'react';
import {Link} from "react-router-dom";
import RestaurantOverview from "./RestaurantOverview";
import RestaurantMenu from "./RestaurantMenu";

import RestaurantForm from "./RestaurantForm";
import DriverForm from "./DriverForm";
import SignUpSuccess from "../dialog/SignUpSuccess";

const styles = {
    navItem: { border: "0px", color: "white", background:"#343A40"},
};

export class RestaurantInfo extends Component { 
  state = {
            numItems: 1,
            currentContent: "",
            navBarHeight: 0,
  }

  handleStep1OnClick = this.handleStep1OnClick.bind(this);
  handleCreatedAccount = this.handleCreatedAccount.bind(this);
  handleDialogClose = this.handleDialogClose.bind(this);

  

  displayOverview = () => {
    this.setState({currentContent:"Overview"});
    {this.getContent()};
  }

  displayMenu = () => {
    this.setState({currentContent:"Menu"});
    {this.getContent()};
  }

  getContent = () => {
        switch(this.state.currentContent){
            case "Overview":
                return <RestaurantOverview />
            case "Menu":
                return <RestaurantMenu />;
            default:
                return <div>CONTENT NOT FOUND</div>
        }
    }

  handleStep1OnClick(e){
        var step1Selection;
        if(e.target.name === "overview")
            step1Selection = "Overview";
        else 
            step1Selection = "Menu";
        this.setState({currentStep: 2, step1Selection});
    }

    getStep2Content(){
        if(this.state.currentStep > 1){
            if(this.state.step1Selection === "Overview"){
                return <RestaurantOverview />
            }
            if(this.state.step1Selection === "Menu") {
                return <RestaurantMenu />
            }
        }
    }

    handleCreatedAccount(){
        this.setState({signUpSuccess: true})
    }

    handleDialogClose(){
        this.setState({
            signUpSuccess: false,
        },() => {
            window.location.href="/"
        });
    }
  
  render () {  
  const {currentContent} = this.state;                                  
    return (
      <div>
    
        <p></p>

        <div className="row" style={{textAlign: "left", padding: "0 5%", marginTop: "10%", fontSize: "0.8vw", lineHeight: "0.8"}}>
            <div className="col">
                <div className="row">
                    <div className="step-col col border bg-light"><h6>McDonald's</h6></div>       
                </div>
                <nav className="navbar navbar-expand-md navbar-dark bg-dark" ref="navBar" >
                  <div className="collapse navbar-collapse" id="navbarSupportedContent">
                  <ul className="navbar-nav mr-auto">
                      <li>                       
                          <button className="nav-link" name="overview" onClick={this.handleStep1OnClick} style={styles.navItem}>Overview</button>                      
                      </li>
                      <li>              
                          <button className="nav-link" name="menu" onClick={this.handleStep1OnClick} style={styles.navItem}>Menu</button>
                      </li>

                  </ul>
                  </div>
                </nav>
                <div className="row">
                  
                    <div className="w-100"></div>
                    <div className="col" style={{padding: "2% 0", marginTop: "0%", marginLeft: "5%", width:"500px"}}>
                        {this.getStep2Content()}
                    </div>
                </div>
            </div>
        </div> 


      </div>
      )
  }
}

export default RestaurantInfo;