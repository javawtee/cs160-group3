import React, { Component } from 'react';

const styles = {
    navItem: { border: "0px", color: "white", background:"#343A40"},
};

export class RestaurantOverview extends Component { 
  state = { 
    
  }


  render () {                                    
    return (
      <div>
        <p>Classic, long-running fast-food chain known for its burgers, fries & shakes.</p>
        <p>Late-night food · Breakfast · Quick bite</p><br/>
        <p><img src="http://www.sclance.com/pngs/location-symbol-png/./location_symbol_png_811020.png" width="20" height="20" />
          2850 Augustine Dr, Santa Clara, CA 95054
        </p>

      </div>
      )
  }
}

export default RestaurantOverview;