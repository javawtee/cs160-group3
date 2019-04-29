import React, { Component } from 'react';
import { render } from 'react-dom';

var map;
var marker;
var path = [];
var geocoder;

class Tracker extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this)
  }
  
  handleStart(e){
	  var i = 0;
	  function f() {
		  marker.setPosition({lat: path[i].lat(),lng: path[i].lng()});
		  i++;
		  if( i < path.length ){
			  setTimeout( f, 1000 );
		    }
		}
	f();
  }
  
  codeLatLng() {
	geocoder = new window.google.maps.Geocoder();
    var location = marker.getPosition();
    geocoder.geocode( { 'location': location}, function(results, status) {
      if (status == 'OK') {
        alert(JSON.stringify(results[0].formatted_address, null, 2));
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  }

  
  onScriptLoad() {
	const directionsDisplay = new window.google.maps.DirectionsRenderer;
    const directionsService = new window.google.maps.DirectionsService;
    map = new window.google.maps.Map(
      document.getElementById(this.props.id),
      this.props.options);
	marker = new window.google.maps.Marker({
            position: { lat: 37.76, lng: -122.40 },
            map: map,
            title: 'Marker!'
	})
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
			var route = response.routes[0].overview_path;
			for (var i = 0; i < route.length; i++) {
				path.push(new window.google.maps.LatLng(response.routes[0].overview_path[i].lat(), response.routes[0].overview_path[i].lng()));
            }
            directionsDisplay.setDirections(response);
          } else {
            window.alert('Directions request failed due to ' + status);
          }
        });
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
		<button onClick={this.handleStart}>Start Route</button>
		<button onClick={this.codeLatLng}>Get Location</button>
      <div style={{ width: 500, height: 500 }} id={this.props.id} />
	</div>
    );
  }
}

export default Tracker