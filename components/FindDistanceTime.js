import React, { Component } from 'react';
import { render } from 'react-dom';


class FindDistanceTime extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this)
	this.state = {
      distance: null,
      time: null,
    };
  }
  
  onScriptLoad() {
	var origin = this.props.origin;
	var destination = this.props.destination;
	var service = new window.google.maps.DistanceMatrixService();
	callback = callback.bind(this);
	service.getDistanceMatrix(
	{
		origins: [origin],
		destinations: [destination],
		travelMode: 'DRIVING',
		drivingOptions: {
			departureTime: new Date(Date.now()),
			trafficModel: "bestguess"
		},
		unitSystem: window.google.maps.UnitSystem.IMPERIAL,
        avoidHighways: false,
        avoidTolls: false

	}, callback);
	function callback(response, status) {
  if (status == 'OK') {
	  this.setState({
		  distance: JSON.stringify(response.rows[0].elements[0].distance.value, null, 2),
		  time: JSON.stringify(response.rows[0].elements[0].duration_in_traffic.value, null, 2)
	  });
  }
  else {
	  alert("error");
  }
}
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
  
  formatDist(distance){
	  //still need to write this
	  return distance;
  }
  
  formatTime(time){
	  //still need to write this
	  return time;
  }
  
  convertDistToCost(distance){
	  //still need to write this
	  return distance;
  }

  render() {
    return (
      <div>
		<h2>Distance: {this.formatDist(this.state.distance)}</h2>
		<h3>Time: {this.formatTime(this.state.time)}</h3>
		<h4>Cost: {this.convertDistToCost(this.state.distance)}</h4>
	  </div>
    );
  }
}

export default FindDistanceTime