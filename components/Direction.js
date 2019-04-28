import React, { Component } from 'react'
import DirectionsMaker from "./DirectionsMaker";

export class Direction extends Component {
  render() {
    return (
      <DirectionsMaker
        id="myMap"
        id2="myDirections"
        sourceLat={37.76}
        sourceLng={-122.40}
        destLat={37.7749}
        destLng={-122.4194}
        options={{
          center: { lat: 12.85, lng: -54.65 },
          zoom: 3
        }}
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