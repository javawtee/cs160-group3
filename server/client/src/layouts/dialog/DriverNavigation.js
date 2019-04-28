import React, { Component } from 'react';
import {Dialog} from "@material-ui/core";
import Direction from "../../components/Direction";

export class DriverNavigation extends Component {
  render() {
    const {origin, destination, ...others} = this.props
    return (
        <Dialog id="driverNavigationDialog" {...others} maxWidth="lg">
            <Direction origin={origin} destination={destination} />
        </Dialog>
    )
  }
}

export default DriverNavigation
