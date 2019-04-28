import React, { Component } from 'react'
import DriverIncomingRequest from "../dialog/DriverIncomingRequest";
import DriverNavigation from "../dialog/DriverNavigation";

export class DriverConsole extends Component {
  constructor(props){
    super(props);
    this.state = {
      ws: null,
      driver_uuid: JSON.parse(sessionStorage.getItem("user-token")).uuid, // can't be null
      started: JSON.parse(sessionStorage.getItem("user-token")).started, // can't be null
      delivering: JSON.parse(sessionStorage.getItem("user-token")).delivering, // can't be null
      currentLocation: {},
      destination: "", // straight address
      openDriverNavigation: false,
      openDriverIncomingRequest: false,
      deliveryDetails:{},  // load from database and within componentWillMount
      deliverySummary: {}
    };
  }

  componentWillMount = () => {    
    //fetch delivery request

    // prevent from losing ws connection
    if(this.state.started){
      this.setState({ws: new WebSocket("ws://localhost:5001/driver")})
    }
  }

  updateSessionForStartedDelivering = () => {
    var session = JSON.parse(sessionStorage.getItem("user-token"));
    session.started = this.state.started;
    session.delivering = this.state.delivering;
    sessionStorage.setItem("user-token", JSON.stringify(session));
  }

  getCurrentLocation = (callback) => {
    // not supported without https
    // navigator.geolocation.getCurrentPosition(
    //   (position) => {
    //     var latitude = position.coords.latitude;
    //     var longitude = position.coords.longitude;
    //     if(callback !== undefined){
    //       callback(latitude, longitude); // destination is used to open driver navigation
    //     }
    //   },
    //   (error) => alert(error),
    //   { enableHighAccuracy: false, timeout: 200000, maximumAge: 1000 },
    // );
    fetch("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI",{
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
    })
    .then(res => res.json())
    .then(data => {
      var latitude = data.location.lat;
      var longitude = data.location.lng;
      if(callback !== undefined){
        callback(latitude, longitude); // destination is used to open driver navigation
      }
    })
  }

  handleStartStop = (e) => {
    e.preventDefault();
    const {ws, started, delivering, driver_uuid} = this.state;
    if(!started){
      this.getCurrentLocation((latitude, longitude) => {
        var currentLocation = {latitude, longitude};
        this.setState({currentLocation}, () => {
          var ws= new WebSocket("ws://3.87.213.235:5001/driver")
          ws.onopen = () => {
            const {currentLocation} = this.state;
            var clientMetaData = {
              action: "start",
              uuid: driver_uuid,
              location: currentLocation,
            }
            ws.send(JSON.stringify(clientMetaData));
          }
          ws.onmessage = (e) => {
            // receiving order request
            var request = JSON.parse(e.data);
            if(request.uuid === driver_uuid){
              // request for this driver
              var deliverySummary = this.summarizeDelivery(request.deliveryDetails)
              this.setState({deliveryDetails: request.deliveryDetails, deliverySummary, openDriverIncomingRequest: true})
            }
            // if the request is not for this driver, ignore it 
            // REQUEST FOR LOCATION
            if(request.message !== undefined && request.message === "need-your-location"){
              this.getCurrentLocation((latitude, longitude) => {
                var currentLocation = {latitude, longitude};
                var id = request.id;
                ws.send(JSON.stringify({message: "here-your-location", id, driverLocation: currentLocation}));
              })
            }
          };
          this.setState({ws, started: true}, () => this.updateSessionForStartedDelivering())
        });
      });
    } else if(started && !delivering){ // prevent from using geolocation api
      var clientMetaData = {
        action: "stop",
        uuid: driver_uuid,
      }
      ws.send(JSON.stringify(clientMetaData));
      this.setState({ws: null, started: false}, () => this.updateSessionForStartedDelivering())
    } else if(delivering){
      alert("You have order(s) not delivered. Can't STOP now")
    }
  }

  summarizeDelivery = (deliveryDetails) => {
    const {restaurant, orders} = deliveryDetails;
    var deliverySummary = {
      restaurant,
      totalOrders: orders.length,
      totalEDT: orders.reduce((a,b) => a.estimatedDeliveryTime + b.estimatedDeliveryTime)
    }
    return deliverySummary;
  }

  closeDriverIncomingRequest = (accepted) => {
    this.setState({openDriverIncomingRequest: false}, () => {
      var {driver_uuid, deliveryDetails} = this.state;
      if(!accepted){
        // return order to server
        this.state.ws.send(JSON.stringify({action: "rejected", deliveryDetails}));
        this.setState({deliveryDetails: {}, deliverySummary: {}});
      } else {
        // accepted, update delivery status for order(s)
        this.state.ws.send(JSON.stringify({action: "accepted", uuid: driver_uuid, deliveryDetails}));
        this.setState({delivering: true, deliverySummary: {}});
      }
    })
  }

  openDriverNavigation = (e) => {
    e.preventDefault();
    var destination = e.target.name;
    // get current position of driver
    this.getCurrentLocation((latitude, longitude) => {
      var currentLocation = {latitude, longitude};
      this.setState({currentLocation, destination, openDriverNavigation: true});
    })
  }

  closeDriverNavigation = () => {
    this.setState({openDriverNavigation: false});
  }

  deliveredOrder = (id) => {
    var orders = this.state.deliveryDetails.orders.filter(order => order.id === id);
    var deliveryDetails = {
      restaurant: this.state.deliveryDetails.restaurant,
      orders
    };
    this.state.ws.send(JSON.stringify({action:"delivered", deliveryDetails}));
    deliveryDetails.orders = this.state.deliveryDetails.orders.filter(order => order.id !== id);
    this.setState({deliveryDetails}, () => {
      if(this.state.deliveryDetails.orders.length === 0){
        this.setState({delivering: false, deliveryDetails: {}, deliverySummary: {}}, () => {
            // driver becomes available
            this.getCurrentLocation((latitude, longitude) => {
              var location = {latitude, longitude};
              this.state.ws.send(JSON.stringify({action:"start", uuid: this.state.driver_uuid, location}))
            })
        });
      }
    });
  }

  renderDeliveryDetails = () => {
    if(this.state.deliveryDetails.restaurant !== undefined){
      const {restaurant, orders} = this.state.deliveryDetails;
      const getRequestOrders = orders.map((order, id) => 
        <li key={id}>
          <div>
            To: {order.customerName}<br/>
            Estimated delivery time: {(order.estimatedDeliveryTime/60000)} minutes<br/>
            Address: <a name={order.customerAddress} href="/ghost-link" onClick={this.openDriverNavigation}>{order.customerAddress}</a><br/>
            Phone number: {order.customerPhone} <br/>
            <a href="/order/:ordernumber">Ordered items</a><br/>
            <button className="btn btn-danger" onClick={() => this.deliveredOrder(order.id)}>DELIVERED?</button>
          </div>
        </li>
      )

      return (
        <>
          From: {restaurant.name} <br/>
          Address: <a name={restaurant.address} href="/ghost-link" onClick={this.openDriverNavigation}>{restaurant.address}</a>
          <ul>
            {getRequestOrders}
          </ul>
        </> 
      );
    } else {
      return <div>No request</div>
    }
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
            {this.renderDeliveryDetails()}
          </div>
        </div>
        <DriverIncomingRequest 
          open={this.state.openDriverIncomingRequest}
          onClose={this.closeDriverIncomingRequest} 
          deliverySummary={this.state.deliverySummary}
        />
        <DriverNavigation 
          open={this.state.openDriverNavigation} 
          onClose={this.closeDriverNavigation} 
          origin={this.state.currentLocation}
          destination={this.state.destination}
        />
      </div>
    )
  }
}

export default DriverConsole
