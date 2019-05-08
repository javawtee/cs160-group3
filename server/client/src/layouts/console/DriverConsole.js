import React, { Component } from 'react';
import Auth from "../../components/Auth";
import DriverIncomingRequest from "../dialog/DriverIncomingRequest";
import DriverNavigation from "../dialog/DriverNavigation";

var wsCheckInterval;

export class DriverConsole extends Component {
  constructor(props){
    super(props);
    this.state = {
      ws: new WebSocket("ws://localhost:5001/driver", JSON.parse(sessionStorage.getItem("user-token")).uuid),
      action: () => console.log("do nothing when first established"),
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

  checkWSConnection = (ws, action) => {
    if(ws.readyState === 0){ // CONNECTING
      console.log("Web socket is connecting")
      this.setState({action}, () => {
        this.setWebSocketListener();
      })
    } else if(ws.readyState === 1){ // OPEN
      console.log("Web socket is currently open. Sending action");
      action();
    } else {
      console.log("Web socket is closed. Reconnecting...");
      this.setState({ws: new WebSocket("ws://localhost:5001/driver", JSON.parse(sessionStorage.getItem("user-token")).uuid), action}, () => {
        this.checkWSConnection(this.state.ws, this.state.action);
      })
    }
  }

  setWebSocketListener = () => {
    const ws = this.state.ws;
    ws.onopen = () => {
      console.log("Web socket is open. Sending action");
      this.checkWSConnection(ws, () => this.state.action());
    }
    ws.onerror = () => {
      alert("Web server is down :(");
    }
    ws.onmessage = (e) => {
      var res = JSON.parse(e.data);
      if(this.state.started && res.request.uuid === this.state.driver_uuid){
        console.log(new Date() + ": Ding! A message from server");
        // notify server that update has been received
        this.checkWSConnection(ws, () => ws.send(JSON.stringify({action:"received-request", uuid: this.state.driver_uuid})));
        switch(res.message){
          case "order-request":
            // request for this driver
            var deliverySummary = this.summarizeDelivery(res.request.deliveryDetails)
            this.setState({deliveryDetails: res.request.deliveryDetails, deliverySummary, openDriverIncomingRequest: true})
            break;
          case "fetch-request":
            var deliveryDetails = res.request.deliveryDetails;
            this.setState({deliveryDetails});
            break;
          // using switch, so if I want to implement tracking, different message
          default:
            break;
        }
      }
    };
    ws.onclose = () => {
      console.log("connection closed");
      alert("ALERT! Server crashes. Restarting");
      // remove tokens => force to logout
      Auth.logout();
      window.location.href = "/";
    }
  }

  componentWillUnmount(){ clearInterval(wsCheckInterval) }

  componentDidMount(){
    this.setWebSocketListener();

    // fetch request if delivering
    if(this.state.delivering){
      var uuid = this.state.driver_uuid;
      fetch("/driver/fetch-request", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({uuid})
      }).then(res => res.json())
      .then(res => {
        if(res.message === "fetched"){
          console.log(res.request.deliveredDetails);
          this.setState({deliveryDetails: res.request.deliveryDetails})
        } else {
          console.log("something goes wrong");
        }
      })
    }

    // checking driver's ws connection every 15s
    wsCheckInterval = setInterval(() => {
      if(this.state.started){
        this.checkWSConnection(this.state.ws, opened => {if(!opened) this.setWebSocketListener()})
      }
    }, 15000);
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
        this.setState({started: true, currentLocation}, () => {
          this.updateSessionForStartedDelivering();
          this.checkWSConnection(ws, () => ws.send(JSON.stringify({action: "start", uuid: driver_uuid, location: this.state.currentLocation})));
        });
      });
    } else if(started && !delivering){ // prevent from using geolocation api
      this.checkWSConnection(ws, () => ws.send(JSON.stringify({action: "stop", uuid: driver_uuid})));
      this.setState({started: false}, () => this.updateSessionForStartedDelivering())
    } else if(delivering){
      alert("You have order(s) not delivered. Can't STOP now")
    }
  }

  convertETAtoString = ETA => {
    var minutes = Math.floor(ETA / 60);
    return minutes + " mins "; // convert to String
  }

  summarizeDelivery = (deliveryDetails) => {
    const {restaurant, orders} = deliveryDetails;
    var totalETA = orders.length > 1 ? orders[0].ETA + orders[1].ETA : orders[0].ETA; // in seconds
    totalETA = this.convertETAtoString(totalETA);
    var deliverySummary = {
      restaurant,
      totalOrders: orders.length,
      totalETA,
    }
    return deliverySummary;
  }

  closeDriverIncomingRequest = (accepted) => {
    this.setState({openDriverIncomingRequest: false}, () => {
      const {ws} = this.state;
      var {driver_uuid, deliveryDetails} = this.state;
      if(!accepted){
        // return order to server
        this.getCurrentLocation((latitude, longitude) => {
          var currentLocation = {latitude, longitude};
          var driver = {
            uuid: driver_uuid,
            location: currentLocation,
          }
          this.setState({deliveryDetails: {}, deliverySummary: {}}, () => {
            this.checkWSConnection(ws, () => ws.send(JSON.stringify({action: "rejected", driver, deliveryDetails})));
          });
        })
      } else {
        // accepted, update delivery status for order(s)
        this.getCurrentLocation((latitude, longitude) => {
          var driverLocation = {latitude, longitude};
          this.setState({delivering: true, deliverySummary: {}}, () => {
            this.updateSessionForStartedDelivering();
            this.checkWSConnection(ws, () => ws.send(JSON.stringify({action: "accepted", uuid: driver_uuid, deliveryDetails, driverLocation})));
          });
        })
      }
    })
  }

  openDriverNavigation = (e) => {
    e.preventDefault();
    // geocode string address to lat,long
    fetch("https://maps.googleapis.com/maps/api/geocode/json" +
            "?address=" + e.target.name +
            "&key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI")
    .then(res => res.json())
    .then(payload => {
      if(payload.results.length > 0){
        var latitude = payload.results[0].geometry.location.lat;
        var longitude = payload.results[0].geometry.location.lng;
        var destination = {latitude, longitude};
        // get current position of driver
        this.getCurrentLocation((latitude, longitude) => {
          var currentLocation = {latitude, longitude};
          this.setState({currentLocation, destination, openDriverNavigation: true});
        })
      }
    })
  }

  closeDriverNavigation = () => {
    this.setState({openDriverNavigation: false});
  }

  sendToHistory = order => {
    this.props.sendToHistory(order);
  } 

  deliveredOrder = (id) => { // id as order id
    const ws = this.state.ws;
    var orders = this.state.deliveryDetails.orders;
    var orderIndex = orders.findIndex(order => order.id === id);
    var deliveryDetails = {
      restaurant: this.state.deliveryDetails.restaurant,
      orders:[orders[orderIndex]]
    };
    this.checkWSConnection(ws, () => ws.send(JSON.stringify({action:"delivered", deliveryDetails})));
    // update to history
    var order = {
      orderDate: new Date(),
      restaurantName: this.state.deliveryDetails.restaurant.name,
      restaurantAddress: this.state.deliveryDetails.restaurant.address
    };
    this.sendToHistory(order);
    // persist data in front-end
    orders.splice(orderIndex, 1);
    if(orders.length > 0){
      deliveryDetails = {
        restaurant: this.state.deliveryDetails.restaurant,
        orders
      };
      this.setState({deliveryDetails});
    } else {
      // no more order
      this.setState({delivering: false, deliveryDetails: {}, deliverySummary: {}}, () => {
        // driver is not delivering
        this.checkWSConnection(ws, () => ws.send(JSON.stringify({action:"finished-delivery", uuid: this.state.driver_uuid})));
        // driver becomes available
        this.getCurrentLocation((latitude, longitude) => {
          var location = {latitude, longitude};
          this.checkWSConnection(ws, () => ws.send(JSON.stringify({action:"start", uuid: this.state.driver_uuid, location})));
          this.updateSessionForStartedDelivering();
        })
      });
    }
  }

  renderDeliveryDetails = () => {
    if(this.state.deliveryDetails.restaurant !== undefined){
      const {restaurant, orders} = this.state.deliveryDetails;
      const renderItemList = (items) => {
        if(typeof(items) === "string"){
          // prevent exception: loading from back-end
          items = JSON.parse(items);
        }
        const itemList = items.map((item) => 
          item.name + " (" + item.amount + ")\n" 
        )
        return itemList;
      }
      const getRequestOrders = orders.map((order, id) => 
        <li key={id}>
          <div>
            To: {order.customerName}<br/>
            ETA from restaurant: { this.convertETAtoString(order.ETA) } <br/>
            Address: <a name={order.customerAddress} href="/ghost-link" onClick={this.openDriverNavigation}>{order.customerAddress}</a><br/>
            Phone number: {order.customerPhone} <br/>
            <div className="col text-left" style={{marginLeft:"-1vw", marginBottom:"-2vh"}} 
                  data-toggle="tooltip" data-placement ="bottom" title={renderItemList(order.orderedItems)}>
              {(typeof(order.orderedItems) === "string" ? JSON.parse(order.orderedItems) : order.orderedItems).length} item(s)
            </div><br/>
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
