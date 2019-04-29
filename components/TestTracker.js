import React, { Component } from 'react'
import Tracker from "./Tracker";

export class TestTracker extends Component {
  render() {
    return (
      <Tracker
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
      />
    );
  }

}

export default TestTracker