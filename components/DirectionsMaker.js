import React, { Component } from 'react';
import { render } from 'react-dom';

class DirectionsMaker extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this)
  }

  onScriptLoad() {
	const directionsDisplay = new window.google.maps.DirectionsRenderer;
    const directionsService = new window.google.maps.DirectionsService;
    const map = new window.google.maps.Map(
      document.getElementById(this.props.id),
      this.props.options);
	directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById(this.props.id2));
	var chicago = new window.google.maps.LatLng(this.props.sourceLat, this.props.sourceLng);
    var sf = new window.google.maps.LatLng(this.props.destLat, this.props.destLng);
	directionsService.route({
          origin: chicago,
          destination: sf,
          travelMode: 'DRIVING'
        }, function(response, status) {
          if (status === 'OK') {
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
    this.props.onMapLoad(map)
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