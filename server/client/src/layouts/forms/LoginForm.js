import React, { Component } from 'react'
import Auth from "../../components/Auth";

import { Checkbox } from '@material-ui/core';

export class LoginForm extends Component {
    constructor(props){
      super(props);
      this.state = {    
        userName: '',
        password: '',
        saveLocal: false,
      };
    }

    onLogin = (e) => {
      e.preventDefault();
      const {userName, password} = this.state;
      if(userName !== "" && password !== ""){
          fetch("/login", 
            {
            method: "POST",
            headers: {
              "Accept": "application/json",
              "Content-Type": "application/json"
            },
            body: JSON.stringify({userName, password})
          })
          .then(res => res.json())
          .then(payload => {
            if(payload.numOfResults === 0)
              alert("Username or Password is incorrect");
            else {
              alert("successfully logged in");
              Auth.login(this.state.saveLocal, payload.results[0]); // create session
              this.props.switchToConsole(); // passing to HomePage
            }
            //this.setState({session_username: payload.results[0]})
              //this.setState({userName: payload.results[0]}) //should redirect to UserConsole here
          }) // whenever setState is called, this component will be re-rendered
      } else 
          alert("Username or Password cannot be empty")
    }

    handleOnChange = (e) => {
        this.setState({[e.target.name]:e.target.value})
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
                  <input type="text" className="form-control" placeholder="Username" name="userName"
                          value={this.state.userName} onChange={this.handleOnChange} autoFocus autoComplete='off'/>
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
                <Checkbox onChange={() => this.setState({saveLocal: true})}/> Save password<br/>
                <a href='aDialog' onClick={()=>alert('building...')}>Forgot password?</a><br/><br/>
              </div>

              <div className="w-100"></div>
              <div className="col-12">
                <button className="col btn btn-primary" type='submit'>Login</button>
              </div>
            </div>
          </div>
        </form>
      </div>
    )
  }
}

export default LoginForm
