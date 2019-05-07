import React, { Component } from 'react'
import Auth from "../../components/Auth";
import ForgotPassword from "../dialog/ForgotPassword";
import { Checkbox } from '@material-ui/core';
import uuid5 from "uuid/v5";

export class LoginForm extends Component {
    constructor(props){
      super(props);
      this.state = {    
        userId: '',
        password: '',
        rememberMe: false,
        forgotPassword: false,
        who: this.props.who
      };
    }
    handleOpenForgotPassword = this.handleOpenForgotPassword.bind(this);
    handleDialogClose = this.handleDialogClose.bind(this);

    onLogin = (e) => {
      e.preventDefault();
      const {userId, password} = this.state;
      if(localStorage.getItem("user-token") !== null){
        alert("ALERT! Multiple Access");
        window.location.href = "https://www.google.com"
        return;
      }
      if(userId !== "" && password !== ""){
          const NAMESPACE = "45e669ee-e736-4354-9efc-e1d620b18c69"; // random UUID
          const uuid = uuid5(userId, NAMESPACE)
          fetch("/user/login", 
            {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({uuid, userId, password})
          })
          .then(res => res.json())
          .then(resp => {
            if(resp.message === "success") {
              Auth.login(this.state.rememberMe, resp.serverToken); // create login session
              this.props.switchToConsole(); // passing to HomePage
            } else if (resp.message === "multiple-access") {
              alert("ALERT! Multiple Access");
              window.location.href = "https://www.google.com"
            } else {
              alert("UserID or Password is incorrect");
            }
          }) // whenever setState is called, this component will be re-rendered
      } else 
          alert("UserID or Password cannot be empty")
    }

    handleOnChange = (e) => {
        this.setState({[e.target.name]:e.target.value})
    }

    handleOpenForgotPassword(e){
      e.preventDefault();
      this.setState({forgotPassword: true})
    }

    handleDialogClose(){
      this.setState({forgotPassword: false})
    }
  render() {
    return (
      <div>
        <form onSubmit={this.onLogin} >
          <div className="container" style={{padding: "0 20%"}}>
            <div className="row">
              <div className="col">
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <img src="/media/user-ico.png" alt="" width="100%"/>
                    </span>
                  </div>
                  <input type="text" className="form-control" placeholder="UserID" name="userId"
                          value={this.state.userId} onChange={this.handleOnChange} autoFocus autoComplete='off'/>
                </div>
              </div>

              <div className="w-100"></div>
              <div className="col">
                <div className="input-group mb-3">
                  <div className="input-group-prepend">
                    <span className="input-group-text">
                      <img src="/media/key-ico.png" alt="" width="100%"/>
                    </span>
                  </div>
                  <input type="password" className="form-control" placeholder="Password" name="password"
                          value={this.state.password} onChange={this.handleOnChange} 
                          onFocus={() =>this.setState({password: ''})}/>
                </div>
              </div>

              <div className="w-100"></div>
              <div className="col">
                <Checkbox onChange={() => this.setState(prev => ({rememberMe: !prev.rememberMe}))}/> Remember Me<br/>
                <a href='/forgot-password' onClick={this.handleOpenForgotPassword}>Forgot password?</a><br/><br/>
              </div>

              <div className="w-100"></div>
              <div className="col-12">
                <button className="col btn btn-primary" type='submit'>Login</button><br/>
                <a href="/" onClick={this.props.handleCustomerSignUp} style={{display: this.state.who !== undefined ? "block" : "none"}}>
                  Create an account
                </a>
              </div>
            </div>
          </div>
        </form>
        <ForgotPassword open={this.state.forgotPassword} onClose={this.handleDialogClose} />
      </div>
    )
  }
}

export default LoginForm
