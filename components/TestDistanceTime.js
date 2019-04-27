import React, { Component } from "react";
import FindDistanceTime from "./FindDistanceTime";


export class TestDistanceTime extends Component {
  render() {
    return (
	<div>
	<FindNearestDriver origin="1299 E Santa Clara St, San Jose, CA 95116" destination="1398 W San Carlos, San Jose, CA 95126" />
    </div>
	)
  }

}

export default TestDistanceTime