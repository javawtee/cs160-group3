import React, { Component } from 'react';

class DirectionsMaker extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this)
  }

  onScriptLoad() {
    const directionsDisplay = new window.google.maps.DirectionsRenderer();
    const directionsService = new window.google.maps.DirectionsService();
    //const map = new window.google.maps.Map(document.getElementById(this.props.id),this.props.options);
    const map = new window.google.maps.Map(document.getElementById(this.props.id));
	  directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById(this.props.id2));
    var origin = new window.google.maps.LatLng(this.props.origin.latitude, this.props.origin.longitude);
    var destination = new window.google.maps.LatLng(this.props.destination.latitude, this.props.destination.longitude);
    //var test = new window.google.maps.LatLng(37.78, -122.42);
    //var destinations = [{origin, destination}
    // destinations.forEach(adestination => {
      directionsService.route({
        origin,
        destination,
        travelMode: 'DRIVING'
      }, function(response, status) {
        if (status === 'OK') {
          directionsDisplay.setDirections(response);
        } else {
          window.alert('Directions request failed due to ' + status);
        }
      });
    //   var request = {
    //     origin: adestination.origin,
    //     destination: adestination.destination,
    //     travelMode: 'DRIVING'
    //   };
      
    //   var directionsDisplay = new window.google.maps.DirectionsRenderer;
    //   directionsDisplay.setMap(map);
    //   directionsDisplay.setPanel(document.getElementById(this.props.id2));

    // directionsService.route(request, (result, status) => {
    //     console.log(result);

    //     if (status == "OK") {
    //         directionsDisplay.setDirections(result);
    //     }
    //   });
    // })
    //this.props.onMapLoad(map)
  }

  componentDidMount() {
    if (!window.google) {
      var s = document.createElement('script');
      s.type = 'text/javascript';
      s.src = 'https://maps.google.com/maps/api/js?key=AIzaSyAo-8nuqyyTuQI1ALVFP4aWsY-BisShauI';
      var x = document.getElementsByTagName('script')[0];
      x.parentNode.insertBefore(s, x);
      // Below is important. 
      //We cannot access google.maps until it's finished loading
      s.addEventListener('load', e => {
        this.onScriptLoad()
      })
    } else {
      this.onScriptLoad()
    }
  }

  render() {
    return (
    <div>
        <div style={{ width: 500, height: 500 }} id={this.props.id} />
        <div style={{ width: 500, height: 500 }} id={this.props.id2} />
    </div>
    );
  }
}

export default DirectionsMaker