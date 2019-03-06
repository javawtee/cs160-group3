import React, { Component } from 'react';
import {Route} from 'react-router-dom'

import LoginForm from './layouts/forms/LoginForm'
import UserConsole from './layouts/UserConsole'

import './App.css'

class App extends Component {
  state = {
    login: false,
    signup: false,
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
    var signup = !this.state.signup
    if(form === 'login')
      this.setState({login, signup: false})
    else
      this.setState({signup, login: false})
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
    const {login, signup} = this.state
    return (
      <div className="App" >
        <Route exact path='/' render={() => {
          if(sessionStorage.getItem('username') !== '')
            window.location.href = '/console'
          else {
            return (
              <div id='home-container'>
                <div id='home-nav'>
                </div>
                <div id='home-div'>
                  <div className='home-common-div' onClick={() =>this.formClick('login')}>Login</div>
                  <div className='login-form home-common-div' style={{display: login? 'block': 'none' }}>
                    <LoginForm onLogin={(e,userID,password) => this.onLogin(e,userID,password)}/>
                  </div>
                  <div className='home-common-div' onClick={() =>this.formClick('signup')}>Sign up</div>
                  <div className='signup-form home-common-div' style={{display: signup? 'block': 'none' }}>Sign up Form</div>
                </div>
              </div>
            )
          }
        }}/>
        <Route path='/console' component={UserConsole}/>
      </div>
    );
  }
}

export default App;
