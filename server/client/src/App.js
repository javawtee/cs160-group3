import React, { Component } from "react";
import {Route, Redirect, Switch} from "react-router-dom";
import Auth from "./components/Auth";

import HomePage from "./layouts/HomePage";
import DriverConsole from "./layouts/console/DriverConsole";

import "./App.css"

class App extends Component {
    state = {
      authenticated: Auth.checkAuth(),
    }

  render() {
    const { authenticated } = this.state;
    return (
      <div className="App" >
        <Switch>
          <Route exact path="/" component={() => 
            authenticated ? <Redirect to="/console"/> : <HomePage switchToConsole={() => this.setState({authenticated: true})} content="login"/>} />
          <Route exact path="/:content(sign-up|about)" 
            component={(props) =>  authenticated? <Redirect to="/console"/> : <HomePage content={props.match.params.content} />} />
          <Route exact path="/console" component={() =>  authenticated? <DriverConsole /> : <Redirect to="/"/>}/>
          <Route path="*" render={() => "404 PAGE NOT FOUND"} />
        </Switch>        
      </div>
    );
  }
}

export default App;
