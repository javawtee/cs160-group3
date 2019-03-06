import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { Checkbox } from '@material-ui/core';

export class LoginForm extends Component {
    state = {    
        userName : '',
        userID: '',
        password: '',
        pwtype: 'password', // default
        pwVisibility: false
    }

    onChange = (e) => {
        this.setState({[e.target.name]:e.target.value})
    } // this is how we get value of text inputs in React

    togglePwVisibility = () => {
      this.setState({pwVisibility: !this.state.pwVisibility}, () => {
        if(this.state.pwVisibility)
          this.setState({pwtype: 'text'})
        else
          this.setState({pwtype: 'password'})
      })
    }
  render() {
    return (
      <div>
        <form onSubmit={(e) => this.props.onLogin(e,this.state.userID, this.state.password)} >
            Username: <TextField name='userID' value={this.state.userID} onChange={this.onChange} placeholder='username' 
                                autoFocus autoComplete='off'/><br/>
            <span id='pw-eye' onClick={this.togglePwVisibility} 
                    style={{backgroundImage: this.state.pwVisibility ? `url(${'./media/eye-no-pw.png'})`:`url(${'./media/eye-pw.png'})`}}></span>
            Password: <TextField name='password' value={this.state.password} onChange={this.onChange} type={this.state.pwtype}
                                  onFocus={() =>this.setState({password: ''})}/><br/>
            <Checkbox onChange={()=>alert('building...')}/> Save password<br/>
            <a href='aDialog' onClick={()=>alert('building...')}>Forgot password?</a><br/>
            <Button type='submit'>Login</Button>
        </form>
      </div>
    )
  }
}

export default LoginForm
