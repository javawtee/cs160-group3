import React, { Component } from 'react'

export class DriverConsole extends Component {
  render() {
    return (
      <div className="container">
        <div className="row">
          <div className="col">Status: Unavailable</div>
        </div>
        <div className="row">
          <div className="col">
            <button className="btn btn-primary">START</button>
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
