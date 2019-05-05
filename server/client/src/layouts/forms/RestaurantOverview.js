import React, { Component } from 'react';

const styles = {
    navItem: { border: "0px", color: "white", background:"#343A40"},
};

export class RestaurantOverview extends Component { 
  constructor(props) {
    super(props);
    this.showTime = this.showTime.bind(this);
    this.showAllTime = this.showAllTime.bind(this);
    this.state= {clicked: true}
  }



  showTime = () => {
    return <p>Monday 8:00am - 9:00 pm ▼</p> 
  }

  showAllTime = () => {
    return (
      <>
      <p>Sunday 10:00am - 9:00 pm</p>
      <p>Monday 8:00am - 9:00 pm</p> 
      <p>Tuesday 10:00am - 9:00 pm</p>
      <p>Wednesday 10:00am - 9:00 pm</p>
      <p>Thursday 10:00am - 9:00 pm</p>
      <p>Friday 10:00am - 9:00 pm</p>
      <p>Saturday 10:00am - 9:00 pm</p>
      </>
    );
  }



  render () {                                    
    return (
      <div>
        <p>Classic, long-running fast-food chain known for its burgers, fries & shakes.</p>
        <p>Late-night food · Breakfast · Quick bite</p>

        <hr width="95%"/>

        <p><img src="https://cdn4.iconfinder.com/data/icons/pictype-free-vector-icons/16/location-alt-512.png" width="20" height="20" />
           2850 Augustine Dr, Santa Clara, CA 95054
        </p>

        <hr width="95%"/>

        <p><img src="https://image.flaticon.com/icons/png/512/44/44631.png" width="17" height="17" />  Hours Open:</p>
        <div onClick= {() => this.setState({clicked: !this.state.clicked})}>
         {
            this.state.clicked? this.showTime() : this.showAllTime()
         }
         <br/>
    
         </div>


      </div>

      )
  }
}

export default RestaurantOverview;