import React, { Component } from 'react'
import { Button } from '@material-ui/core';

export class UserConsole extends Component {
    state = {
        username: ''
    }

    logOut = (e) => {
        e.preventDefault();
        console.log('asdaf')
        sessionStorage.setItem('username', '')
        window.location.href = '/'
    }

    componentWillMount(){
        this.setState({username:sessionStorage.getItem('username')}, () => {
            if(this.state.username === ''){
                window.location.href = '/'
            }
        })
    }

  render() {
    if(this.state.username !== '') {
        return (
        <div style={{color: '#000', fontSize: '3em'}}>
            Welcome, {this.state.username}<br/>
            <Button onClick={this.logOut}>Logout</Button>
        </div>
        )
    }
    return (<div></div>)
  }
}

export default UserConsole
