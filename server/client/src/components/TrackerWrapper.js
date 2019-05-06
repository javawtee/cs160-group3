import React, { Component } from 'react'
import Tracker from "./Tracker";

export class TrackerWrapper extends Component {
    constructor(props){
        super(props);
        this.origin = this.props.origin
        this.destination = this.props.destination
    }
  render() {
    return (
      <Tracker
        open={this.props.open}
        id="myMap"
		    id2="myDirections"
		    origin={this.origin}
        destination={this.destination}
        options={{
          center: { lat: 12.85, lng: -54.65 },
          zoom: 3
        }}
      />
    );
  }

}

export default TrackerWrapper