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
              OUR MOTTO HERE<br/>
              MAYBE SOME INTRODUCTION HERE<hr/><br/><br/><br/>
              <form>
                userid: <TextField placeholder='userID' /><br/> 
                password: <TextField type='password' /><br/>
                <Button type='submit'>Login</Button>
              </form>
            </div>
        )} />
      </div>
    );
  }
}

export default App;
