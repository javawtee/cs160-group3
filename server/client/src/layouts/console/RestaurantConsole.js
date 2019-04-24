import React, { Component } from 'react';

import PlaceOrder from "../dialog/PlaceOrder";

export class RestaurantConsole extends Component { 
  state = { 
    orders: [],
    openPlaceOrder: false,
  }

  componentWillMount(){
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

  checkOut = (orders) => { // orders is an array of JSON strings
    const newOrders = this.state.orders;
    // send an array of orders (1 or 2 elements) request to back-end
    const restaurant_uuid = JSON.parse(sessionStorage.getItem("user-token")).uuid;
    fetch("/restaurant/" + restaurant_uuid + "/add-orders", 
      {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({orders})
    })
    .then(res => res.json())
    .then(result => alert(result))
    // store records in front-end
    orders.map(order => newOrders.push(order));
    this.setState({orders: newOrders});
  }

  renderOrders = () => {
    if(this.state.orders.length === 0){
      return <div> No order found for today </div>
    }

    const renderItemList = (items) => {
      const itemList = items.map((item) => 
        item.name + " (" + item.amount + ")\n" 
      )
      return itemList;
    }
    
    const orderList = this.state.orders.map((order, id) =>
        <div className="row" key={id}>
          <div className="col-1 border ">{id + 1}</div>
          <div className="col-2 border text-left">{order.customerName}</div>
          <div className="col-2 border text-left">{order.customerPhone}</div>
          <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerAddress}>
            {order.customerAddress}
          </div>
          <div className="col-2 border text-left" data-toggle="tooltip" data-placement ="bottom" title={renderItemList(order.orderedItems)}>
            {order.orderedItems.length} item(s)
          </div>
          <div className="col border text-left">
              looking for driver
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
      </div>
      )
  }
}

export default RestaurantConsole;