import React, { Component } from 'react';
import Auth from "../../components/Auth";
import PlaceOrder from "../dialog/PlaceOrder";
import DriverTracker from "../dialog/DriverTracker";

var wsCheckInterval;

export class RestaurantConsole extends Component {
  constructor(props){
    super(props);
    this.state = { 
      restaurant_uuid: JSON.parse(sessionStorage.getItem("user-token")).uuid, // can't be null
      ws: new WebSocket("ws://localhost:5002/restaurant", JSON.parse(sessionStorage.getItem("user-token")).uuid),
      action: () => console.log("do nothing when first established"),
      geocode: {}, // restaurant's geocode : {latitude, longitude}
      orders: [],
      driverLocation: {},
      destination: {},
      openPlaceOrder: false,
      openDriverTracker: false,
    }
  }

  checkWSConnection = (ws, action) => {
    if(ws.readyState === 0){ // CONNECTING
      console.log("Web socket is connecting")
      this.setState({action}, () => {
        this.setWebSocketListener();
      })
    } else if(ws.readyState === 1){ // OPEN
      console.log("Web socket is currently open. Sending action");
      action(true);
    } else {
      console.log("Web socket is closed. Reconnecting...");
      this.setState({ws: new WebSocket("ws://localhost:5002/restaurant",JSON.parse(sessionStorage.getItem("user-token")).uuid), action}, () => {
        this.checkWSConnection(this.state.ws, this.state.action);
      })
    }
  }

  setWebSocketListener = () => {
    const {ws, restaurant_uuid} = this.state;
    ws.onopen = () => {
      console.log("Web socket is open. Sending action");
      this.checkWSConnection(ws, () => this.state.action());
    }
    ws.onerror = e => {
      console.log(e)
    }
    ws.onmessage = (e) => {
      var res = JSON.parse(e.data); // res = {uuid, id, deliveryStatus}
      if(res.uuid === restaurant_uuid){
        console.log("Ding! A message from server");
        // notify server that update has been received
        this.checkWSConnection(ws, () => ws.send(JSON.stringify({message:"received-update", uuid: restaurant_uuid})));
        var newUpdatedOrders = this.state.orders;
        // update delivery status
        var order = newUpdatedOrders.filter(order => order.id === res.id);
        if(order.length > 0){ // prevent server's exception
          order = order[0];
          // get driver's location
          if(res.driverLocation !== undefined && res.driverLocation !== null){
            order.driverLocation = res.driverLocation;
          }
          order.deliveryStatus = res.deliveryStatus;
          // newUpdatedOrders.map(order => { if(order.id === res.id) order.deliveryStatus = res.deliveryStatus; })
          this.setState({orders: newUpdatedOrders}, () => this.sendToHistory());
        }
      }
    }
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
    this.checkWSConnection(this.state.ws, opened => {if(!opened) this.setWebSocketListener()});

    // checking restaurant's ws connection every 15s
    wsCheckInterval = setInterval(() => {
      this.checkWSConnection(this.state.ws, opened => {if(!opened) this.setWebSocketListener()})
    }, 15000);
    

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
    .then(resp => { // payload is an array of today orders of restaurant_uuid
      if(resp === "success"){
        this.setState({orders: resp.rows})
      }
      // else do nothing because we have conditional check for orders.length
    }).catch(msg => {
      if(msg === "error"){
        // force to logout
        alert("Web Server can't authorize you. Please log-in again. Sorry for the inconvenience");
        Auth.logout();
        window.location.href="/";
      }
    })

    if(JSON.parse(sessionStorage.getItem("user-token").geocode === undefined)){
      // set restaurant's geocode to session
      fetch("https://maps.googleapis.com/maps/api/geocode/json" +
            "?address=" + JSON.parse(sessionStorage.getItem("user-token")).address +
            "&key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI")
      .then(res => res.json())
      .then(payload => {
        if(payload.results.length > 0){
          var latitude = payload.results[0].geometry.location.lat;
          var longitude = payload.results[0].geometry.location.lng; // don't know why it returns -
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

  openDriverTracker = (e) => {
    e.preventDefault();
    var orderId = e.target.name; // String
    // get driver's location
    var thisOrder = this.state.orders.filter(order => order.id === Number(orderId))[0];
    var driverLocation = typeof(thisOrder.driverLocation) === "string" ? JSON.parse(thisOrder.driverLocation) : thisOrder.driverLocation;
    fetch("https://maps.googleapis.com/maps/api/geocode/json" +
            "?address=" + thisOrder.customerAddress +
            "&key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI")
      .then(res => res.json())
      .then(payload => {
        if(payload.results.length > 0){
          var latitude = payload.results[0].geometry.location.lat;
          var longitude = payload.results[0].geometry.location.lng;
          var destination = {latitude, longitude};
          this.setState({driverLocation, destination}, () => this.setState({openDriverTracker: true}));
        }
      })
  }

  closeDriverTracker = () => {
    this.setState({openDriverTracker: false});
  }

  sendToHistory = () => {
    var orders = [];
    this.state.orders.forEach(order => {
      if(order.deliveryStatus !== 2){
        orders.push(order);
      } else {
        this.props.sendToHistory(order);
      }
    })
  
    this.setState({orders});
  } 

  checkOut = orders => { // orders is an array of JSON strings
    const restaurant_uuid = this.state.restaurant_uuid;
    const name = JSON.parse(sessionStorage.getItem("user-token")).userName; // restaurant's name; can't be null
    const address = JSON.parse(sessionStorage.getItem("user-token")).address; // restaurant's address; can't be null
    const geocode = this.state.geocode;
    async function processOrders(thisInstance){
      const promises =  orders.map(async order => {
        // add new property `deliveryStatus` to order
        order.deliveryStatus = 0; // 0 means looking for driver
        return order.customerAddress;
      });

      // destinations = [address1, address2]
      const destinations = await Promise.all(promises);
      var gService = new window.google.maps.DistanceMatrixService();
      gService.getDistanceMatrix({
              origins: [address],
              destinations,
              travelMode: 'DRIVING',
              drivingOptions: {
                  departureTime: new Date(Date.now()),
                  trafficModel: "bestguess"
              },
              unitSystem: window.google.maps.UnitSystem.IMPERIAL,
              avoidHighways: false,
              avoidTolls: false
      }, async (res, status) => {
          if(status === "OK"){
              const otherPromises = res.rows[0].elements.map(async (element,id) => {
                // calculate delivery fee and estimate delivery time for each other
                var minimumFee = id === 0 ? 6 : 0;
                var distance = element.distance.value; // in meter
                distance = distance * 0.000621371; // convert to miles ( ~1 meter =  0.000621371, google.com)
                var deliveryFee = minimumFee + (distance * 2); //$2 for every mile
                deliveryFee = "$" + deliveryFee.toFixed(2); // convert to String
                var ETA = element.duration_in_traffic.value; // in seconds
                return {deliveryFee, ETA}; // {String, number_in_seconds}
              })              

              // geoResults = [{deliveryFee, ETA}]
              const geoResults = await Promise.all(otherPromises);

              var temp = orders;

              temp.forEach((order, id) => {
                order.deliveryFee = geoResults[id].deliveryFee;
                order.ETA = geoResults[id].ETA;
              })

              var sortedByETA = temp.length > 1 ? temp.sort((a,b) => {return a.ETA - b.ETA;}) : temp;
              
              var deliveryDetails = {
                restaurant: {
                  name,
                  address,
                  geocode,
                },
                orders: sortedByETA,
              }

              //console.log(deliveryDetails);

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
              .then(resp => { // message:"success", orders ([] of orderwith inserted id's)s
                if(resp.message === "success"){ 
                  var orders = resp.orders;
                  var temp = thisInstance.state.orders;
                  // store records in client-side
                  orders.forEach(order => temp.push(order));
                  thisInstance.setState({orders: temp});
                } else if (resp.message === "error") {
                  alert("Web Server can't authorize your process. Try again");
                } else { // message:"no-affect"
                  alert("Your request is not successfully processed. Try again");
                }
              }).catch(msg => {
                if(msg === "error"){
                  // force to logout
                  alert("Web Server can't authorize you. Please log-in again. Sorry for the inconvenience");
                  Auth.logout();
                  window.location.href="/";
                }
              })
          } else {
              console.log("ERR-calculateDeliveryFee: " + status)
              alert("Failed to calculate fee. Free delivery :)");
          }
      });
    }
    
    processOrders(this);
  }

  renderOrders = () => {
    if(this.state.orders.length === 0 || this.state.orders.length === this.state.orders.filter(order => order.deliveryStatus === 2).length){
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
          return (
          <a name={orderId} href="/ghost-link" onClick={this.openDriverTracker} 
             data-toggle="tooltip" data-placement="bottom" title="Click here to see where driver is at">
            In-Delivery
          </a>
          )
        default:
          return "error";
      }
    }
    
    const orderList = this.state.orders.filter(order => order.deliveryStatus !== 2).map((order, id) => 
        <div className="row" key={id}>
          <div className="col-1 border ">{id + 1}</div>
          <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerName}>
            {order.customerName}
          </div>
          <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerPhone}>
            {order.customerPhone}
          </div>
          <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerAddress}>
            {order.customerAddress}
          </div>
          <div className="col-1 border text-left" data-toggle="tooltip" data-placement ="bottom" title={renderItemList(order.orderedItems)}>
            {(typeof(order.orderedItems) === "string" ? JSON.parse(order.orderedItems) : order.orderedItems).length} item(s)
          </div>
          <div className="col border text-left" data-toggle="tooltip" data-placement ="bottom" title={order.deliveryFee || ""}>
            {order.deliveryFee || ""}
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
            <div className="col-1 border">Items</div>
            <div className="col border">Delivery Fee</div> 
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
                
        <DriverTracker
          open={this.state.openDriverTracker} 
          onClose={this.closeDriverTracker}
          origin={this.state.driverLocation}
          destination={this.state.destination}
        />
      </div>
      )
  }
}

export default RestaurantConsole;
