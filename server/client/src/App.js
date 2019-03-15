import React, { Component } from "react";
import {Route, Switch} from "react-router-dom"

import HomePage from "./layouts/HomePage";

import "./App.css"

class App extends Component {
  render() {
    return (
      <div className="App" >
        <Switch>
          <Route exact path="/" component={() => <HomePage content="login"/>} />
          <Route exact path="/:content(sign-up|about)" component={(props) => <HomePage content={props.match.params.content} />} />
          <Route path="*" render={() => "404 PAGE NOT FOUND"} />
        </Switch>        
      </div>
    );
  }
}

export default App;
