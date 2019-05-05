import React, { Component } from 'react';
import RestaurantInfo from "../forms/RestaurantInfo";
import MapContainer from "../MapContainer";
import OrderInfo from "../OrderInfo";

export class RestaurantConsole extends Component { 
  state = { 
    numItems: 1,
    openOrderInfo: false,
  }



  increaseItemCount = () => {
    this.setState({
      numItems: this.state.numItems + 1
    });  
  }
  renderItemFields = () => {
    let fields = [];

    for (let i = 0; i < this.state.numItems; i++) {
      fields.push( 
        <form id='form'>     
          <input className='input' type="text"   
          placeholder="Item name"/>
          
          <input className='input' type="text"  
          placeholder="Quantity"/>          
               
          <input className='input' type="text" 
          placeholder="Delivery address"/>
        </form>
      )
    }

    return fields;
  }


  handleOrderInfoOpen = (e) => {
    e.preventDefault();
    this.setState({openOrderInfo: true});
  }
  
  handleOrderInfoClose = () => {
    console.log("clear session");
    this.setState({openOrderInfo: false});
  }
  
  render () {                                    
    return (
      <div>
        <div>
          <div id='restaurantContainer'>

            {/*<button className="btn btn-primary" onClick={this.handleOrderInfoOpen}>Place order</button>

            <OrderInfo open={this.state.openOrderInfo} 
                onClose={this.handleOrderInfoClose} />*/}




            {/*<div id='home-common-div'>
              <p>This is the restaurant view</p>
            </div>

            {this.renderItemFields()}

            
            <button id='addItem' onClick={this.increaseItemCount}>Add Item</button>
            <button id='submit'>Place orders</button>*/}

            <RestaurantInfo />



            <MapContainer />


         

          </div>
        </div>
      </div>
      )
  }
}

export default RestaurantConsole;