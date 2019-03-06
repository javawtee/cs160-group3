import React, { Component } from 'react';
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

import User from './User'
import { Checkbox } from '@material-ui/core';

class App extends Component {
  state = {
    userName : '',
    userID: '',
    password: '',
    pwtype: 'password', // default
    showPwChecked: false
  }

  onChange = (e) => {
    this.setState({[e.target.name]:e.target.value})
  } // this is how we get value of text inputs in React

  onSubmit = (e) => {
    e.preventDefault();
    if(this.state.userID !== '' && this.state.password !== ''){
      fetch('/testpage', 
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({userID: this.state.userID, 
                              password: this.state.password})
      })
      .then(res => res.json())
      .then(payload => {
        if(payload.numOfResults === 0)
          alert('userID or password is incorrect')
        else
          this.setState({userName: payload.results[0]})
      }) // whenever setState is called, this component will be re-rendered
    } else 
      alert('userID or password cannot be empty')
  }

  cbOnChange = (e) => {
    this.setState({showPwChecked: !this.state.showPwChecked}, () => {
      if(this.state.showPwChecked)
        this.setState({pwtype: 'text'})
      else
        this.setState({pwtype: 'password'})
    })
  }

  render() {
    return (
      <div className="App" >
        <form onSubmit={this.onSubmit} >
          OUR MOTTO HERE<br/>
          MAYBE SOME INTRODUCTION HERE<hr/><br/><br/><br/>
            userid: <TextField name='userID' value={this.state.userID} onChange={this.onChange} placeholder='your userID' autoFocus/><br/> 
            password: <TextField name='password' value={this.state.password} onChange={this.onChange} type={this.state.pwtype}
                                  onFocus={() =>this.setState({password: ''})}/><br/>
            <Checkbox name='visiblepw' checked={this.state.showPwChecked} onChange={this.cbOnChange}/>Show password<br/>
            <Button type='submit' >Login</Button>
        </form>
        <User userName={this.state.userName} />
      </div>
    );
  }
}

export default App;
