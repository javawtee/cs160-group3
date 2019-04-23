import React, { Component } from 'react';
import { Map, GoogleApiWrapper } from 'google-maps-react';


const mapStyles = {
  width: '50%',
  height: '50%'
};

export class MapContainer extends Component {
  render() {
    const pathCoordinates = [
        { lat: 36.05298765935, lng: -112.083756616339 },
        { lat: 36.2169884797185, lng: -112.056727493181 }
    ];

    return (
      <Map
        google={this.props.google}
        zoom={14}
        style={mapStyles}
        initialCenter={{
         lat: -1.2884,
         lng: 36.8233
        }}


      />
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCncxbis7aq6UNSYcQXvfx17XgmfORUc_k'
})(MapContainer);