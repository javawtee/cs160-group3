import React, { Component } from 'react';
import {Dialog} from "@material-ui/core";
import TrackerWrapper from "../../components/TrackerWrapper";

export class DriverTracker extends Component {
  render() {
    const {origin, destination,open, ...others} = this.props
    return (
        <Dialog id="driverTrackerDialog" open={open} {...others} maxWidth="lg">
            <TrackerWrapper origin={origin} destination={destination} open={open}/>
        </Dialog>
    )
  }
}

export default DriverTracker
