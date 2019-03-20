import React, { Component } from "react";
import {Route, Redirect, Switch} from "react-router-dom";
import Auth from "./components/Auth";

import HomePage from "./layouts/HomePage";
import User from "./layouts/User";

import "./App.css"

class App extends Component {
    state = {
      authenticated: Auth.isAuthenticated(),
    }

  render() {
    const { authenticated } = this.state;
    const {login, register, applyForDriver} = this.state
    return (
      <div className="App" >
        <Switch>
          <Route exact path="/" component={() => 
            authenticated ? <Redirect to="/console"/> : <HomePage switchToConsole={() => this.setState({authenticated: true})} content="login"/>} />
          <Route exact path="/:content(sign-up|about)" 
            component={(props) =>  authenticated? <Redirect to="/console"/> : <HomePage content={props.match.params.content} />} />
          <Route exact path="/console" component={() =>  authenticated? <User /> : <Redirect to="/"/>}/>
          <Route path="*" render={() => "404 PAGE NOT FOUND"} />
        </Switch>        
      </div>
    );
  }
}

export default App;
