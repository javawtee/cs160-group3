import React, { Component } from 'react';
import {Route} from 'react-router-dom';
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import './stylesheets/App.css';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Route exact path='/' render={props => (
            <div className='Login'>
              <br/><h1>Drop Off</h1><br/>
              <h2> Welcome to our Delivery Service</h2><br/><br/><br/>
              <form>
                UserID: <TextField placeholder='          userID'/> <br/> 
                Password: <TextField type='password'/><br/>
                <Button type='submit'>Login</Button>
              </form>
            </div>
        )} />
      </div>
    );
  }
}

export default App;
