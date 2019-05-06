import React, { Component } from 'react'

import RestaurantForm from "./forms/RestaurantForm";
import DriverForm from "./forms/DriverForm";
import SignUpSuccess from "./dialog/SignUpSuccess";

export class SignUp extends Component {
    state = {
        currentStep: 1,
        step1Selection: "",
        signUpSuccess: false,
    }
    handleStep1OnClick = this.handleStep1OnClick.bind(this);
    handleCreatedAccount = this.handleCreatedAccount.bind(this);
    handleDialogClose = this.handleDialogClose.bind(this);

    handleStep1OnClick(e){
        var step1Selection;
        if(e.target.name === "driver")
            step1Selection = "Driver";
        else 
            step1Selection = "Restaurant";
        this.setState({currentStep: 2, step1Selection});
    }

    getStep2Content(){
        if(this.state.currentStep > 1){
            if(this.state.step1Selection === "Restaurant"){
                return <RestaurantForm createdAccount={this.handleCreatedAccount}/>
            }
            if(this.state.step1Selection === "Driver") {
                return <DriverForm createdAccount={this.handleCreatedAccount}/>
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

  render() {
    return (
        <div className="row" style={{textAlign: "left", padding: "0 5%", marginTop: "-20%", fontSize: "0.8vw", lineHeight: "0.8"}}>
            <div className="col">
                <div className="row">
                    <div className="step-col col border bg-light"><h6>SO, YOU ARE ...</h6></div>
                    <div className="w-100" style={{textAlign: "center"}}>
                        <button className="btn btn-secondary"
                            style={{display: this.state.currentStep === 2? "" : "none"}} disabled>
                            {this.state.step1Selection}
                        </button>
                        <span style={{display: this.state.currentStep === 2? "" : "none", paddingLeft: "1%", cursor: "pointer"}}
                            onClick={()=>this.setState({currentStep: 1})}> 
                           <a href="/sign-up#">You are not?</a>
                        </span>
                    </div>
                    <div className="col" 
                            style={{textAlign: "center", padding: "1% 2%", display: this.state.currentStep === 2 ? "none" : ""}}>
                        <button className="btn btn-secondary" name="driver" onClick={this.handleStep1OnClick}>Driver</button><br/><br/>
                        <button className="btn btn-secondary" name="restaurant" onClick={this.handleStep1OnClick}>Restaurant</button>
                    </div>
                </div>
                <div className="row">
                    <div className="step-col col border bg-light"
                            style={{display: this.state.currentStep === 2 ? "" : "none"}}><h6>SIGN UP FORM</h6></div>
                    <div className="w-100"></div>
                    <div className="col" style={{padding: "2% 0", marginTop: "-3%"}}>
                        {this.getStep2Content()}
                    </div>
                </div>
            </div>
            <SignUpSuccess open={this.state.signUpSuccess} onClose={this.handleDialogClose}/>
        </div> 
    )
  }
}

export default SignUp
