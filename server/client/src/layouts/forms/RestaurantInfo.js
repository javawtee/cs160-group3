import React, { Component } from 'react';
import {Link} from "react-router-dom";
import RestaurantOverview from "./RestaurantOverview";
import RestaurantMenu from "./RestaurantMenu";

export class RestaurantInfo extends Component { 
  state = { 
    numItems: 1,
    currentContent: ""
  }
  componentWillMount(){
        const currentContent = this.props.content;
        this.setState({currentContent});
    }
    
    componentDidMount(){
        this.setState({navBarHeight: this.refs.navBar.clientHeight});
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
          
        </form>
      )
    }

    return fields;
  }
  getContent(){
        switch(this.state.currentContent){
            case "Overview":
                return <RestaurantOverview />
            case "Menu":
                return <RestaurantMenu />;
            default:
                return <div>CONTENT NOT FOUND</div>
        }
    }
  
  render () {  
  const {currentContent} = this.state;                                  
    return (
      <div>
        <nav className="navbar navbar-expand-md navbar-dark bg-dark" ref="navBar" >
              <button className="navbar-toggler" type="button" 
                      data-toggle="collapse" data-target="#navbarSupportedContent" 
                      aria-controls="navbarSupportedContent" 
                      aria-expanded="false" 
                      aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                  <li>
                      <Link className={currentContent === "Overview" ? "nav-item active" : "nav-item"} to="/">
                          <div className="nav-link">Overview</div>
                      </Link>
                  </li>
                  <li>
                      <Link className={currentContent === "Menu" ? "nav-item active" : "nav-item"} to="/">
                          <div className="nav-link">Menu</div>
                      </Link>
                  </li>
                  
              </ul>
              </div>
          </nav>
       
     
            
        <p>Overview</p>
        

        {this.renderItemFields()}

        
        <button id='addItem' onClick={this.increaseItemCount}>Add Item</button>
        <button id='submit'>Place orders</button>
         
 
      </div>
      )
  }
}

export default RestaurantInfo;