import React, { Component } from 'react';

export class MapContainer extends Component {
  componentDidMount = () => {
    if (!window.google) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://maps.google.com/maps/api/js?key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI';
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
      // Below is important. 
      //We cannot access google.maps until it's finished loading
      s.addEventListener('load', e => {
        this.initMap()
      })
    } else {
      this.initMap()
    }
  }
  
  initMap = () => {
    var map = new window.google.maps.Map(document.getElementById('map'), {
      center: {lat: this.props.location.latitude, lng: this.props.location.longitude},
      zoom: 15
    });
    new window.google.maps.Marker({position: {lat: this.props.location.latitude, lng: this.props.location.longitude}, map});
  }

  render() {
    // const pathCoordinates = [
    //     { lat: 36.05298765935, lng: -112.083756616339 },
    //     { lat: 36.2169884797185, lng: -112.056727493181 }
    // ];

    return (
      <div>
        <div style={{ width: 400, height: 400 }} id="map" />
      </div>
    )
  }
}

export default MapContainer