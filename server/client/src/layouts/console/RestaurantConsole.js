import React, { Component } from 'react';

import PlaceOrder from "../dialog/PlaceOrder";
import DriverNavigation from "../dialog/DriverNavigation";

export class RestaurantConsole extends Component {
  constructor(props){
    super(props);
    this.state = { 
      ws: null,
      geocode: {}, // restaurant's geocode : {latitude, longitude}
      orders: [],
      driverLocation: {},
      destination: {},
      openPlaceOrder: false,
      restaurant_uuid: JSON.parse(sessionStorage.getItem("user-token")).uuid, // can't be null
      openDriverNavigation: false,
    }
  }

  componentWillMount(){
    var restaurant_uuid = this.state.restaurant_uuid;

    // fetch today orders
    fetch("/restaurant/today", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({restaurant_uuid})
    })
    .then(res => res.json())
    .then(payload => { // payload is an array of today orders of restaurant_uuid
      if(payload.numOfResults > 0){
        this.setState({orders: payload.rows})
      }
      // else do nothing because we have conditional check for orders.length
    })

    if(this.state.ws === null){
      // ws = null => user refreshed page, ws set back to null
      this.setState({ws: new WebSocket("ws://3.87.213.235:5002/restaurant")}, () => {
        const ws = this.state.ws;
        ws.onmessage = (e) => {
          var update = JSON.parse(e.data);
          if(update.uuid === restaurant_uuid){
            var newUpdatedOrders = this.state.orders;
            // update delivery status
            newUpdatedOrders.filter(order => order.id === update.id)[0].deliveryStatus = update.deliveryStatus;
            this.setState({orders: newUpdatedOrders})
          }
          // ---- MESSAGE FROM TRACKER FOR DRIVER's LOCATION
          var res = JSON.parse(e.data);
          if(res.message !== undefined && res.message !== "failed"){
            var driverLocation = res.driverLocation;
            console.log(this.state.orders.filter(order => order.id === res.id))
            var customerAddress = "Lion Supermarket, Newark, CA 94560";
            // geocode destination / customer address
            fetch("https://maps.googleapis.com/maps/api/geocode/json" +
                "?address=" + customerAddress +
                "&key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI")
            .then(res => res.json())
            .then(payload => {
              if(payload.results.length > 0){
                var latitude = payload.results[0].geometry.location.lat;
                var longitude = payload.results[0].geometry.location.lng;
                var destination = {latitude, longitude};
                this.setState({driverLocation, destination});
              }
            })
          }
        }
      });
    }

    if(JSON.parse(sessionStorage.getItem("user-token").geocode === undefined)){
      fetch("https://maps.googleapis.com/maps/api/geocode/json" +
            "?address=" + JSON.parse(sessionStorage.getItem("user-token")).address +
            "&key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI")
      .then(res => res.json())
      .then(payload => {
        if(payload.results.length > 0){
          var latitude = payload.results[0].geometry.location.lat;
          var longitude = payload.results[0].geometry.location.lng;
          var geocode = {latitude, longitude};
          var session = JSON.parse(sessionStorage.getItem("user-token"));
          session.geocode = geocode;
          sessionStorage.setItem("user-token", JSON.stringify(session));
          this.setState({geocode})
        }
      })
    }

    // prevent from losing not checked-out order
    if(JSON.parse(sessionStorage.getItem("ordersInARow")) !== null){
      if(JSON.parse(sessionStorage.getItem("ordersInARow")).length > 0){
        this.setState({openPlaceOrder: true});
      } else {
        // exception: session is not removed when PlaceOrder modal closed
        sessionStorage.removeItem("ordersInARow");
      }
    }
  }

  handlePlaceOrderOpen = (e) => {
    e.preventDefault();
    this.setState({openPlaceOrder: true});
  }
  
  handlePlaceOrderClose = () => {
    console.log("clear session");
    sessionStorage.removeItem("ordersInARow");
    this.setState({openPlaceOrder: false});
  }

  openDriverNavigation = (e) => {
    e.preventDefault();
    var id = Number(e.target.name); // id as order_id
    this.state.ws.send(JSON.stringify({id}));
    this.setState({openDriverNavigation: true});
  }

  closeDriverNavigation = () => {
    this.setState({openDriverNavigation: false});
  }

  checkOut = (orders) => { // orders is an array of JSON strings
    const newOrders = this.state.orders;
    const restaurant_uuid = this.state.restaurant_uuid;
    const name = JSON.parse(sessionStorage.getItem("user-token")).userName; // restaurant's name; can't be null
    const address = JSON.parse(sessionStorage.getItem("user-token")).address; // restaurant's address; can't be null
    const geocode = this.state.geocode;

    orders.map(order => {
      // add new property `deliveryStatus` to order
      order.deliveryStatus = 0; // 0 means looking for driver
      // store records in front-end
      newOrders.push(order)
    });

    var deliveryDetails = {
      restaurant: {
        name,
        address,
        geocode,
      },
      orders,
    }
    // send an array of orders (1 or 2 elements) request to back-end
    fetch("/restaurant/add-orders", 
      {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({restaurant_uuid, deliveryDetails})
    })
    .then(res => res.json())
    .then(payload => {
      if(payload === "failed"){
        alert("Web Server is down")
      }
    })

    this.setState({orders: newOrders});
  }

  renderOrders = () => {
    if(this.state.orders.length === 0){
      return <div> No order found for today </div>
    }

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

    const renderDeliveryStatus = (deliveryStatus, orderId) => {
      switch(deliveryStatus){
        case 0:
          return "Looking for driver";
        case 1:
          return <a name={orderId} href="/ghost-link" onClick={this.openDriverNavigation}>Delivering</a>
        default:
          return "error";
      }
    }
    
    const orderList = this.state.orders.map((order, id) =>
        <div className="row" key={order.id}>
          <div className="col-1 border ">{id + 1}</div>
          <div className="col-2 border text-left">{order.customerName}</div>
          <div className="col-2 border text-left">{order.customerPhone}</div>
          <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerAddress}>
            {order.customerAddress}
          </div>
          <div className="col-2 border text-left" data-toggle="tooltip" data-placement ="bottom" title={renderItemList(order.orderedItems)}>
            {(typeof(order.orderedItems) === "string" ? JSON.parse(order.orderedItems) : order.orderedItems).length} item(s)
          </div>
          <div className="col border text-left">
              {renderDeliveryStatus(order.deliveryStatus, order.id)}
          </div>
        </div>
    );

    return (
      <div className="container mt-2 mb-2">
        <div className="row">
          <div className="col-1 border">Order ID</div>
          <div className="col-2 border">Customer name</div>
          <div className="col-2 border">Customer phone</div>
          <div className="col-2 border">Customer address</div>
          <div className="col-2 border">Items</div>
          <div className="col border">Status</div>
        </div>
        {orderList}
      </div>
    );    
  }
  
  render () {                                    
    return (
      <div className="container">
        <div className="row border-bottom p-1">
          <div className="col-6" style={{paddingTop: "0.7%"}}>ORDERS</div>
          <div className="col-6" style={{textAlign: "right"}}>
            <small>Automated request for delivery on Check-out</small> &nbsp;
            <button className="btn btn-primary" onClick={this.handlePlaceOrderOpen}>Place order</button>
            
          </div>
        </div>

        {this.renderOrders()}

        <PlaceOrder open={this.state.openPlaceOrder} 
                onClose={this.handlePlaceOrderClose} 
                checkOut={this.checkOut} />
                
        <DriverNavigation 
          open={this.state.openDriverNavigation} 
          onClose={this.closeDriverNavigation}
          origin={this.state.driverLocation}
          destination={this.state.destination}
        />
      </div>
      )
  }
}

export default RestaurantConsole;
