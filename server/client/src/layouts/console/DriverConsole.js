import React, { Component } from 'react'

export class DriverConsole extends Component {
  constructor(props){
    super(props);
    this.state = {
      started: false,
      delivering: false,
    }
  }
  handleStartStop = this.handleStartStop.bind(this);

  handleStartStop(e){
    e.preventDefault();
    this.setState((prevState) => ({started: !prevState.started}));
  }

  render() {
    const {started, delivering} = this.state;
    return (
      <div className="container">
        <div className="row">
          <div className="col pb-2">Status: 
            <span style={{color: "red", fontSize: "1.1em", paddingLeft: "1%"}}>
              {started? delivering? "DELIVERING" : "AVAILABLE" : "UNAVAILABLE"}
            </span>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <button className="btn btn-primary" onClick={this.handleStartStop}>
              {started? "STOP": "START"}
            </button>
          </div>
        </div>
        <div className="row" style={{paddingTop: "2%"}}>
          <div className="col"><h4>Request</h4></div>
          <div className="w-100"></div>
          <div className="col">
            From: Restaurant A <br/>
            Address: <a href="/navigation/:address">123 XYZ, SJ, CA 11111</a>
            <ul>
              <li>
                <div>
                  To: Customer X<br/>
                  <a href="/order/:ordernumber">Ordered items</a><br/>
                  Estimated delivery time: 2 minutes<br/>
                  Address: <a href="/navigation/:address">123 XYZ, SJ, CA 11111 </a>
                </div>
              </li>
              <li>
                <div>
                  To: Customer Y<br/>
                  <a href="/order/:ordernumber">Ordered items</a><br/>
                  Estimated delivery time: 3 minutes<br/>
                  Address: <a href="/navigation/:address">123 XYZ, SJ, CA 11111 </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    )
  }
}

export default DriverConsole
