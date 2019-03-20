import React, { Component } from 'react';
import {BrowserRouter, Route, Switch, Link, Redirect} from 'react-router-dom';

import DriverApplicationForm from './layouts/forms/DriverApplicationForm';
import LoginForm from './layouts/forms/LoginForm';
import RegistrationForm from './layouts/forms/RegistrationForm';
import UserConsole from './layouts/UserConsole';

import Restaurant from './layouts/Restaurant';

import './App.css';

class App extends Component {
  state = {
    login: false,
    register: false,
    applyForDriver: false,
    session_username: '', //should pass a session as prop, this is just for test purpose
  }

  componentDidUpdate(){
    if(this.state.session_username !== ''){
      sessionStorage.setItem('username', this.state.session_username)
      window.location.href = '/console'
    }
  }

  formClick = (form) => {
    var login = !this.state.login
    var register = !this.state.register
    var applyForDriver = !this.state.applyForDriver
    switch(form){
      case 'login':
        return this.setState({login, register: false, applyForDriver: false})
      case 'register':
        return this.setState({register, login: false, applyForDriver: false})
      case 'apply-for-driver':
        return this.setState({applyForDriver, login: false, register: false})
      default:
        return this.setState({register: false, login: false, applyForDriver: false})
    }
  }

  onLogin = (e, userID, password) => {
    e.preventDefault();
    if(userID !== '' && password !== ''){
        fetch('/testpage', 
          {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({userID, password})
        })
        .then(res => res.json())
        .then(payload => {
        if(payload.numOfResults === 0)
          alert('userID or password is incorrect')
        else
          this.setState({session_username: payload.results[0]})
            //this.setState({userName: payload.results[0]}) //should redirect to UserConsole here
        }) // whenever setState is called, this component will be re-rendered
    } else 
        alert('userID or password cannot be empty')
  }

  render() {
    
    const {login, register, applyForDriver} = this.state
    return (
      <BrowserRouter>
      <div className="App" >
        <Route exact path='/' render={() => {
          if(sessionStorage.getItem('username'))
            window.location.href = '/console'
          else {
            return (
              <div id='home-container'>
                <div id='home-div'>
                  <div className='home-common-div' onClick={() =>this.formClick('apply-for-driver')}>Apply For Driver</div>
                  <div className='driver-application-form home-common-div' style={{display: applyForDriver? 'block': 'none' }}>
                    <DriverApplicationForm />
                  </div>
                  <div className='home-common-div' onClick={() =>this.formClick('login')}>Login</div>
                  <div className='login-form home-common-div' style={{display: login? 'block': 'none' }}>
                    <LoginForm onLogin={(e,userID,password) => this.onLogin(e,userID,password)}/>
                  </div>
                  <div className='home-common-div' onClick={() =>this.formClick('register')}>Register</div>
                  <div className='registration-form home-common-div' style={{display: register? 'block': 'none' }}>
                    <RegistrationForm />
                  </div>
                </div>
                <p><a href="/restaurant">Link to restaurant test page</a></p>
              </div>
            )
          }
        }}/>

        <Route path='/console' component={UserConsole}/>

        <Route path='/restaurant' component={Restaurant}/>


      </div> 
      </BrowserRouter>
    );


  }
}

export default App;
