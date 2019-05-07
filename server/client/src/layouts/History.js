import React, { Component } from 'react'

export class History extends Component {
  formatDate = date => {
    var temp = new Date(Date.parse(date));
    var formattedDate = `${temp.getMonth()}/${temp.getDate()}/${temp.getFullYear()}
                         ${temp.getHours()}:${temp.getMinutes()}:${temp.getSeconds()}`;
    return <>{formattedDate}</>
  }

  renderTransactions = list => {
    if(list.length === 0){
      return <div> No past transactions found </div>
    }
    var userType = JSON.parse(sessionStorage.getItem("user-token")).userType;
    if(userType === "restaurant"){
  
      const renderItemList = items => {
        if(typeof(items) === "string"){
          // prevent exception: loading from a string
          items = JSON.parse(items);
        }
        const itemList = items.map(item => 
          item.name + " (" + item.amount + ")\n" 
        )
        return itemList;
      }
      
      const orderList = list.map((order, id) =>
          <div className="row" key={id}>
            <div className="col-1 border ">{id + 1}</div>
            <div className="col-3 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerName}>
              {order.customerName}
            </div>
            <div className="col-2 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerPhone}>
              {order.customerPhone}
            </div>
            <div className="col-3 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.customerAddress}>
              {order.customerAddress}
            </div>
            <div className="col-1 border text-left" data-toggle="tooltip" data-placement ="bottom" title={renderItemList(order.orderedItems)}>
              {(typeof(order.orderedItems) === "string" ? JSON.parse(order.orderedItems) : order.orderedItems).length} item(s)
            </div>
            <div className="col border text-left" data-toggle="tooltip" data-placement ="bottom" title={order.deliveryFee || ""}>
              {order.deliveryFee || ""}
            </div>
          </div>
      );
  
      return (
        <div className="container mt-2 mb-2">
          <div className="container">
            <div className="row" style={{background:"#122b6b", color:"#fff"}}>
              <div className="col-1 border">Order ID</div>
              <div className="col-3 border">Customer name</div>
              <div className="col-2 border">Customer phone</div>
              <div className="col-3 border">Customer address</div>
              <div className="col-1 border">Items</div>
              <div className="col border">Delivery Fee</div> 
            </div>
          </div>
          <div className="container" style={{width:"101.8%", maxHeight:"250px", overflow:"scroll"}}>
            {orderList}
          </div>
        </div>
      );    
    } else {
      // driver
      const orderList = list.map((order, id) =>
          <div className="row" key={id}>
            <div className="col-1 border ">{id + 1}</div>
            <div className="col-3 border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.orderDate}>
              {this.formatDate(order.orderDate)}
            </div>
            <div className="col-4 border text-left text-truncate text-uppercase" 
                  data-toggle="tooltip" data-placement="bottom" title={order.restaurantName}>
              {order.restaurantName}
            </div>
            <div className="col border text-left text-truncate" data-toggle="tooltip" data-placement="bottom" title={order.restaurantAddress}>
              {order.restaurantAddress}
            </div>
          </div>
      );
  
      return (
        <div className="container mt-2 mb-2">
          <div className="container">
            <div className="row" style={{background:"#122b6b", color:"#fff"}}>
              <div className="col-1 border">Order ID</div>
              <div className="col-3 border">Date</div>
              <div className="col-4 border">Restaurant name</div>
              <div className="col border">Restaurant address</div>
            </div>
          </div>
          <div className="container" style={{width:"101.8%", maxHeight:"250px", overflow:"scroll"}}>
            {orderList}
          </div>
        </div>
      );   
    }
  }
  render() {
    return ( 
      <div className="container">
        <div className="row border-bottom p-1">
            <div className="col" style={{paddingTop: "0.7%"}}>PAST TRANSACTIONS (sorted by latest)</div>
        </div>
          {this.renderTransactions(this.props.list)}
      </div>
    )
  }
}

export default History
