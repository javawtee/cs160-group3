import React, { Component } from 'react';
import {Dialog} from "@material-ui/core";

export class DriverIncomingRequest extends Component {
    state = {
        interval: null,
        countdown: 0, // 12 seconds
    }

    componentWillReceiveProps = (nextProps) => {
        if(nextProps.open){
          this.setState({
              countdown: 12,
              interval: setInterval(() => {
                if(this.state.countdown > 0){
                    this.setState(prevState => ({countdown: prevState.countdown -1}));
                } else {
                    // finished countdown
                    this.props.onClose(false);
                }
              }, 1000)
          });
        } else {
          // closes request box
          this.setState({countdown: 0}, () => clearInterval(this.state.interval), () => this.setState({interval: null}))
        }
    }

    renderDeliverySummary = () => {
        if(this.props.deliverySummary.restaurant !== undefined){
            const {restaurant, totalOrders, totalETA} = this.props.deliverySummary;
            return (
                <div className="col mb-2">
                    From: {restaurant.name} <br/>
                    Address: {restaurant.address} <br/>
                    Number of order(s): {totalOrders} <br/>
                    Total estimated delivery time: {totalETA} minutes
                </div>
            )
        } else {
            return <></>
        }
    }
  render() {
    return (
        <Dialog id="driverIncomingRequestDialog" open={this.props.open} maxWidth="lg">
            <div className="col mt-2">ORDER REQUEST <br/><hr/></div>
            {this.renderDeliverySummary()}
            <div className="col mb-2">
                <button className="btn btn-primary" onClick={() => this.props.onClose(true)}>Accept</button> &nbsp;
                <button className="btn btn-danger" onClick={() => this.props.onClose(false)}>Reject ({this.state.countdown})</button>
            </div>
        </Dialog>
    )
  }
}

export default DriverIncomingRequest
