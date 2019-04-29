import React, { Component } from 'react'
import DirectionsMaker from "./DirectionsMaker";

export class Direction extends Component {
  // convert destination (straight address) to lat,long
  constructor(props){
    super(props);
    this.origin = this.props.origin
    this.destination = this.props.destination
  }

  render() {
    return (
      <DirectionsMaker
        id="myMap"
        id2="myDirections"
        origin={this.origin}
        destination={this.destination}
        // options={{
        //   center: { 
        //     lat: ((this.props.currentLocation.latitude + this.destination.latitude)/2), 
        //     lng: ((this.props.currentLocation.longitude + this.destination.longitude)/2) 
        //   },
        //   zoom: 3
        // }}
        onMapLoad={map => {
          var marker = new window.google.maps.Marker({
            position: { lat: 41.0082, lng: 28.9784 },
            map: map,
            title: 'Hello Istanbul!'
          });
        }}
      />
    );
  }

}

export default Direction