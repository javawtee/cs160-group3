import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'
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
            <table>
              <tr>
                <td>Username:</td>
                <td>
                  <TextField name='userID' value={this.state.userID} 
                              onChange={this.onChange} 
                              placeholder='username' 
                              autoFocus autoComplete='off'/>
                </td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Password:</td>
                <td>
                  <TextField name='password' value={this.state.password} 
                                  onChange={this.onChange} 
                                  type={this.state.pwtype}
                                  onFocus={() =>this.setState({password: ''})}/>
                </td>
                <td id='pw-eye' className='tooltip' onClick={this.togglePwVisibility} 
                    style={{backgroundImage: this.state.pwVisibility ? `url(${'./media/eye-no-pw.png'})`:`url(${'./media/eye-pw.png'})`}}>
                    &nbsp;
                    <span class="show-password-ttt tooltiptext">{this.state.pwVisibility ? 'Hide password' : 'Show password'}</span>
                </td>
              </tr>
            </table>
            <Checkbox onChange={()=>alert('building...')}/> Save password<br/>
            <a href='aDialog' onClick={()=>alert('building...')}>Forgot password?</a><br/>
            <button type='submit'>Login</button>
        </form>
      </div>
    )
  }
}

export default LoginForm
