import React, { Component } from 'react';
import { Dialog} from '@material-ui/core';
import MapContainer from "../../components/MapContainer";

export class RestaurantOverview extends Component {
  constructor(props) {
    super(props);
    this.showTime = this.showTime.bind(this);
    this.showAllTime = this.showAllTime.bind(this);
    this.state= {
      clicked: false,
      openMap: false,
      businessHours: [
        {day:"Mon", hours:"8:00 AM - 9:00 PM"},
        {day:"Tue", hours:"10:00 AM - 9:00 PM"},
        {day:"Wed", hours:"10:00 AM - 9:00 PM"},
        {day:"Thu", hours:"10:00 AM - 9:00 PM"},
        {day:"Fri", hours:"8:00 AM - 9:00 PM"},
        {day:"Sat", hours:"8:00 AM - 9:00 PM"},
        {day:"Sun", hours:"10:00 AM - 7:00 PM"},
      ]
    }
  }

  isRestaurantOpen = () => {
    var today = new Date();
    var businessHour = this.state.businessHours[today.getDay()];
    var openTime = businessHour.hours.substring(0, businessHour.hours.indexOf("-")).split("\\s").toString();
    var isOpenA = openTime.indexOf("A") > -1; // open during AM
    var openH = Number(openTime.substring(0, openTime.indexOf(":")));
    var openM = Number(openTime.substring(openTime.indexOf(":") + 1, openTime.indexOf(":") + 3));
    openTime = new Date(
      today.getFullYear(),
       today.getMonth(),
        today.getDate(),
          isOpenA ? openH : openH + 12,
            openM);
      var closeTime = businessHour.hours.substring(businessHour.hours.indexOf("-") + 1).split("\\s").toString();
      var isCloseA = closeTime.indexOf("A") > -1; // close during AM
      var closeH = Number(closeTime.substring(0, closeTime.indexOf(":")));
      var closeM = Number(closeTime.substring(closeTime.indexOf(":") + 1, closeTime.indexOf(":") + 3));
      closeTime = new Date(
        today.getFullYear(),
          today.getMonth(),
          today.getDate(),
            isCloseA ? closeH : closeH + 12,
            closeM);
      return (today.getTime() - openTime.getTime() > 0) && (today.getTime() - closeTime.getTime() < 0);
  }

  showTime = () => {
    return (
      <div className="row mb-2">
        <div className="col-2" style={{color: this.isRestaurantOpen() ? "green" : "red"}}>
          {this.isRestaurantOpen() ? "OPEN" : "CLOSED"}
        </div>
        <div className="col-1" style={{cursor:"pointer"}} onClick= {() => this.setState(prev => ({clicked: !prev.clicked}))}> 
          {this.state.clicked ? "▲" : "▼" }
        </div>
      </div>
    ) 
  }

  showAllTime = () => {
    var isOpen = this.isRestaurantOpen();
    var isToday = id => { return (new Date()).getDay() === id; };
    const getAllTime = this.state.businessHours.map((date,id) => 
      <p key={id} style={{color: isToday(id) ? isOpen ? "green" : "red" : "", fontWeight: isToday(id) ? "bold" : ""}}>
        {date.day} &nbsp; {date.hours}
      </p>
    )
    return getAllTime;
  }

  render() {
    const {open, ...others} = this.props
    const {userName, address, geocode} = JSON.parse(sessionStorage.getItem("user-token"));
    if(!open){
      return <></>
    } else {
        return (
          <Dialog id="restaurantOverviewDialog" open={open} {...others} maxWidth="lg">
              <div className="container">
                <div className="row">
                  <div className="col text-uppercase">
                    <h3>{userName}</h3>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <img src="/media/restaurant-stock-logo.jpg" alt="stock-logo" width="100%" height="300px"/>
                  </div>
                </div>
                <div className="row mt-3">
                  <div className="col">
                    <h6>Description:</h6>
                  </div>
                </div>
                <div className="row">
                  <div className="col border border-top-0 pl-4">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua<br/>
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat
                  </div>
                </div>
                <div className="row">
                  <div className="col pt-3">
                      <img src="https://cdn4.iconfinder.com/data/icons/pictype-free-vector-icons/16/location-alt-512.png" alt="bla" 
                          width="20" height="20" />
                      <a href="/ghost-link" 
                        onClick={e => {
                          e.preventDefault();
                          this.setState(prev => ({openMap: !prev.openMap}))
                        }
                      }>
                        {address}
                      </a>
                  </div>
                </div>
                <div className="row">
                  <div className="col ml-3" style={{display:this.state.openMap ? "" : "none"}}>
                    <MapContainer open={open} location={geocode}/>
                  </div>
                </div>
                <div className="row  mt-3">
                  <div className="col-3">
                    <img src="https://image.flaticon.com/icons/png/512/44/44631.png" alt="bla" width="17" height="17" />  Hours Open:
                  </div>
                  <div className="col-7" style={{marginLeft:"-8vw"}} >
                    {this.showTime()}
                  </div>
                </div>
                <div className="row">
                  <div className="col-3">
                    &nbsp;
                  </div>
                  <div className="col-7" style={{marginLeft:"-8vw"}} >
                    {this.state.clicked? this.showAllTime() : ""}
                  </div>
                </div>
              </div>
          </Dialog>
        )
    }
  }
}

export default RestaurantOverview
