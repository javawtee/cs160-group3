import React, { Component } from 'react';

var map;
var marker;
var path = [];
var geocoder;

class Tracker extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loaded: false,
      path: [],
    };
    
  }

  componentWillReceiveProps = nextProps => {
    if(nextProps.open === true){
      if(!this.state.loaded){
        this.setState({loaded: true}, () => {
          console.log("opened tracker");
          map = new window.google.maps.Map(document.getElementById(nextProps.id), nextProps.options);
          marker = new window.google.maps.Marker({
            position: { lat: nextProps.origin.latitude, lng:  nextProps.origin.longitude },
            map: map,
            title: 'Marker!'
          });
          path = [];
          geocoder = null;
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
        })
      }
    } else {
      this.setState({loaded:false})
    }
  } 

  simulateMoving = i => {
    if(this.state.loaded === false){
      path = [];
      clearTimeout(this.simulateMoving);
      return;
    }
    if(path.length > 0){
      marker.setPosition({lat: path[i].lat(),lng: path[i].lng()});
      i += 3;
      if(i < path.length){
        setTimeout(() => this.simulateMoving(i), 1000);
      }
    }
  }
  
  handleStart = () => {
    this.simulateMoving(0);
  }
  
  codeLatLng() {
    geocoder = new window.google.maps.Geocoder();
      var location = marker.getPosition();
      geocoder.geocode( { 'location': location}, function(results, status) {
        if (status === 'OK') {
          alert(JSON.stringify(results[0].formatted_address, null, 2));
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });
  }

  onScriptLoad = () => {
    const directionsDisplay = new window.google.maps.DirectionsRenderer();
    const directionsService = new window.google.maps.DirectionsService();
    directionsDisplay.setMap(map);
    directionsDisplay.setPanel(document.getElementById(this.props.id2));
    var origin = new window.google.maps.LatLng(this.props.origin.latitude, this.props.origin.longitude);
    var destination = new window.google.maps.LatLng(this.props.destination.latitude, this.props.destination.longitude);
    directionsService.route({
            origin,
            destination,
            travelMode: 'DRIVING'
          }, function(response, status) {
            if (status === 'OK') {
              var route = response.routes[0].overview_path;
              for (var i = 0; i < route.length; i++) {
                path.push(
                  new window.google.maps.LatLng(
                    response.routes[0].overview_path[i].lat(),
                    response.routes[0].overview_path[i].lng()
                  )
                );
              }
              directionsDisplay.setDirections(response);
            } else {
              window.alert('Directions request failed due to ' + status);
            }
    });
  }

  render() {
    return (
	<div>
		<button onClick={this.handleStart}>Simulate moving driver</button>
		<button onClick={this.codeLatLng}>Get driver's current location</button>
      <div style={{ width: 500, height: 500 }} id={this.props.id} />
	</div>
    );
  }
}

export default Tracker