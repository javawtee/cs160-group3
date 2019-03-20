import React, { Component } from 'react';

import '../App.css';

export class Restaurant extends Component { 
  state = { 
    numItems: 1
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
  
  render () {                                    
    return (
      <div>
        <div>
          <div id='restaurantContainer'>
            <div id='home-common-div'>
              <p>This is the restaurant view</p>
            </div>

            {this.renderItemFields()}

            
            <button id='addItem' onClick={this.increaseItemCount}>Add Item</button>
            <button id='submit'>Place order</button>
          </div>
        </div>
      </div>
      )
  }
}

export default Restaurant;