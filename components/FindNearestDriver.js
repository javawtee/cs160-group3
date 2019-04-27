import React, { Component } from 'react';
import { render } from 'react-dom';


class FindNearestDriver extends Component {
  constructor(props) {
    super(props);
    this.onScriptLoad = this.onScriptLoad.bind(this)
	this.state = {
      address: null
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
		destinations: destination,
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
	  var maxValue = Number.MAX_SAFE_INTEGER;
	  var index = 0;
	  var i = 0;
	  for (i = 0;i<destination.length;i++){
		  if (response.rows[0].elements[i].distance.value < maxValue){
			  maxValue = response.rows[0].elements[i].distance.value;
			  index = i;
		  }
	  }
	  this.setState({
		  address: response.destinationAddresses[index]
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
  
  render() {
    return (
      <div>
		<h2>The closest address is {this.state.address}</h2>
	  </div>
    );
  }
}

export default FindNearestDriver