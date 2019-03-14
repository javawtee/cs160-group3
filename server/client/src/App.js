import React, { Component } from "react";
import {Route} from "react-router-dom"

import HomePage from "./layouts/HomePage";
import UserConsole from "./layouts/UserConsole"

import "./App.css"

class App extends Component {
  render() {
    return (
      <div className="App" >
        <Route exact path="/" component={() => <HomePage content="login"/>} />
        <Route exact path="/signUp" component={() => <HomePage content="signUp"/>} />
        <Route path="/console" component={UserConsole}/>
      </div>
    );
  }
}

export default App;
