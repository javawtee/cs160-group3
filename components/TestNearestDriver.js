import React, { Component } from "react";
import FindNearestDriver from "./FindNearestDriver";

export class TestNearestDriver extends Component {
  render() {
    return (
	<div>
	<FindNearestDriver origin="2962 Stringham Way" destination={['2434 Almaden Rd, San Jose, CA 95125','2040 N 1st St, San Jose, CA 95131','1451 Coleman Ave, Santa Clara, CA 95050']} />
    </div>
	)
  }

}

export default TestNearestDriver