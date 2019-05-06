import React, { Component } from 'react';

import Validate from "../../components/Validate";
import LocationSearchInput from "../../components/LocationSearchInput";
import { withStyles } from '@material-ui/core/styles';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import {Dialog,TextField} from "@material-ui/core";
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';

import Menu from "../restaurant/Menu";

const DialogTitle = withStyles(theme => ({
    root: {
      borderBottom: `2px solid #083754`,
      margin: 0,
      padding: theme.spacing.unit * 2,
    },
    closeButton: {
      position: 'absolute',
      right: theme.spacing.unit,
      top: theme.spacing.unit,
      color: theme.palette.grey[500],
    },
  }))(props => {
    const { children, classes, onClose } = props;
    return (
      <MuiDialogTitle disableTypography className={classes.root}>
        <Typography variant="h4">{children}</Typography>
        {onClose ? (
          <IconButton aria-label="Close" className={classes.closeButton} onClick={onClose}>
            <CloseIcon />
          </IconButton>
        ) : null}
      </MuiDialogTitle>
    );
  });

const initialState = {  
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    cardNumber: "",
    cardExpirationM: "",
    cardExpirationY: "",
    cardCCV: "",
    orderedItems:[],
    ordersInARow: JSON.parse(sessionStorage.getItem("ordersInARow")) || [], // place maximum 2 orders at a time
    reset: false,
    errors:[],
};

export class PlaceOrder extends Component {
    constructor(props){
        super(props);
        this.state = initialState;
    }

  componentWillMount = () => {
    setInterval(this.updateOrderRemainingTime, 1000);
  }

  componentWillReceiveProps = (nextProps) => {
      if(nextProps.open && sessionStorage.getItem("ordersInARow") === null){
        console.log("created session");
        sessionStorage.setItem("ordersInARow", JSON.stringify([]));
        this.setState(initialState, () => this.setState({reset: false, orderedItems:[], ordersInARow:[]}));
      }
  }

  // when there is an order in a row (ordersInARow.length > 0)
  // counting down time (60s) and when it finishes, automatically request delivery for order
  updateOrderRemainingTime = () => {
    if(this.state.ordersInARow.length > 0){
        var tempOrdersInARow = this.state.ordersInARow;
        if(tempOrdersInARow[0].remainingTime < 1){
            // finished count-down
            this.checkOut();
            return;
        }
        tempOrdersInARow[0].remainingTime = tempOrdersInARow[0].remainingTime -1;
        sessionStorage.setItem("ordersInARow", JSON.stringify(tempOrdersInARow));
        this.setState({ordersInARow: tempOrdersInARow});
    }
  }

  // clear pending or successful order
  clearOrder = () => {
    sessionStorage.setItem("ordersInARow", JSON.stringify([]))
    this.setState({reset: true, ordersInARow:[]}, () => {
        this.setState({reset: false});
    });
  }

  areValidInputs = () => {
      var errors = this.state.errors;
      errors[0] = !Validate.notEmpty(this.state.customerName); // true: not empty => error = false
      errors[1] = errors[1] || !Validate.notEmpty(this.state.customerAddress); // true: not empty => error = false
      errors[2] = !Validate.validUSPhoneNumberFormat(this.state.customerPhone); // true: valid => error = false
      errors[3] = this.state.cardNumber.length < 16;
      errors[4] = this.state.cardExpirationY.length < 1 || Number(this.state.cardExpirationM) > 12 || Number(this.state.cardExpirationM) < 1;
      var thisYear = Number((new Date()).getFullYear().toString().substring(2));
      errors[5] = this.state.cardExpirationY.length < 2 || Number(this.state.cardExpirationY) < thisYear ;
      if(Number(this.state.cardExpirationY) === thisYear){
        var thisMonth = (new Date()).getMonth() + 1; // getMonth : 0 - 11
        errors[4] = errors[4] || Number(this.state.cardExpirationM) < thisMonth;
      }
      errors[6] = this.state.cardCCV.length < 3;
      if(errors.filter(error => error === true).length > 0 || this.state.orderedItems.length < 1) // has any error, stop submitting
        this.setState({errors}, () => {return false});
      else return true;
  }

  checkOut = () => {
    this.props.checkOut(this.state.ordersInARow); // passing an array of 1 or 2 orders
    if(this.state.ordersInARow.length === 1){
        this.clearOrder();
    }
  }

  handleOnChange = (e) => {
    var newErrors = this.state.errors;
    switch(e.target.name){
        case "customerName":
          newErrors[0] = false;
          break;
        case "customerAddress":
          newErrors[1] = false;
          break;
        case "customerPhone":
          newErrors[2] = false;
          break;
        case "cardNumber":
          newErrors[3] = false;
          break;
        case "cardExpirationM":
          newErrors[4] = false;
          break;
        case "cardExpirationY":
          newErrors[5] = false;
          break;
        case "cardCCV":
          newErrors[6] = false;
          break;
        default:
          break;
    }
    this.setState({[e.target.name]: e.target.value, errors:newErrors})
  }

  handleSubmit = (e) => {
    e.preventDefault();
    if(this.areValidInputs()){
        // second order in a row
        this.addOrder(this.state.ordersInARow);
        this.checkOut()
        this.setState(initialState, () => {
            this.setState({ordersInARow:[]}, () => { // reset ordersInARow to prevent interval delays 1s before stop
                // prevent memory overflow
                clearInterval(this.updateOrderRemainingTime);
                this.props.onClose(); 
            })
        })
    } else {
        alert("Invalid inputs. Can't finalize this order.")
        return;
    }
  }

  updateOrder = (item) => {
    var newOrderedItems = this.state.orderedItems;
    var temp = newOrderedItems.filter(orderedItem => orderedItem.id === item.id);
    if(temp.length > 0){
        if(Number(item.amount) === 0){
            // remove orderedItem with amount 0
            var nonZeroAmount = newOrderedItems.filter(orderedItem => Number(orderedItem.amount) !== 0);
            newOrderedItems = []
            nonZeroAmount.forEach(nonZero => {
                newOrderedItems.push(nonZero);
            })
        } else {
            var orderedItem = temp[0]; // there is only one item with a specific id
            orderedItem.amount = item.amount;
        }
    } else {
        // item doesn't exist
        if(item.amount > 0){
            newOrderedItems.push(item);
        }
    }
    this.setState({orderedItems: newOrderedItems});
  }

  renderOrderedItems = () => {
    if(this.state.orderedItems.length === 0){
        return <tbody><tr><td>No items</td></tr></tbody>
    }

    const orderedItemListing = this.state.orderedItems.map((item, id) => 
        <tr key={id +1}>
            <td className="text-truncate border" style={{minWidth: "20vw", maxWidth:"20vw"}}
                    data-toggle="tooltip" data-placement="bottom" title={item.name}>
                {item.name}
            </td>
            <td className="border text-center">{item.amount}</td>
            <td className="border">{item.price}</td>
            <td className="border">{(item.amount * item.price).toFixed(2)}</td>
        </tr>
    );

    const getTotal = () => {
        var total = 0;
        this.state.orderedItems.forEach(item => {
            total = total + Number((item.amount * item.price).toFixed(2));
        })
        return total.toFixed(2);
    }

    const tax = ((getTotal() * 9)/100).toFixed(2);

    return (
        <tbody>
            <tr key={0}>
                <th className="border">Item name</th>
                <th className="border">Amount</th>
                <th className="border">Price</th>
                <th className="border">Subtotal</th>
            </tr>
            {orderedItemListing}
            <tr key={this.state.orderedItems.length + 1}>
                <td colSpan={3} className="border text-right font-weight-bold"> Tax (9%): </td>
                <td className="border pt-1">{tax}</td>
            </tr>
            <tr key={this.state.orderedItems.length + 2}>
                <td colSpan={3} className="border text-right font-weight-bold pt-2"> <h5>Total:</h5> </td>
                <td className="border pt-1">{(Number(getTotal()) + Number(tax)).toFixed(2)}</td>
            </tr>
        </tbody>
    );
  }

  onClose = () => {
    if(this.state.ordersInARow.length > 0){
        alert("You have an order not checked out. Check out or Cancel before leaving");
        return;
    }
    // prevent memory overflow
    clearInterval(this.updateOrderRemainingTime);
    this.props.onClose();
  }

  continueToPlaceOrder = (e) => {
    e.preventDefault();
    const { ordersInARow}= this.state;
    var temp = ordersInARow;

    if(temp == null){
        //prevent empty array error
        temp = [];
    } else if(temp.length > 0){
        alert("Reached to maximum number of orders at a time");
        return;
    }

    if(this.areValidInputs()){
        this.addOrder(temp);

        const customizedInitialState = initialState;
        customizedInitialState.reset = true;
        customizedInitialState.orderedItems = [];
        customizedInitialState.ordersInARow = temp;

        this.setState(customizedInitialState, () => {
            // prevent resetting again
            this.setState({reset: false})
        });
    } else {
        alert("Invalid inputs. Can't finalize this order");
        return;
    }
  }

  addOrder = ordersInARow => {
    const {customerName, customerPhone, customerAddress, orderedItems } = this.state;
    ordersInARow.push({
        customerName,
        customerAddress,
        customerPhone,
        orderedItems,
        remainingTime: 60, // automatically request delivery after 60 seconds
    });
    sessionStorage.setItem("ordersInARow", JSON.stringify(ordersInARow));
  }

  toggleError = (inputIndex) => {
    return {
      borderColor: this.state.errors[inputIndex] || (inputIndex === 0 && this.state.isDuplicate) ? "red" : "#ced4da",
    }
  }

  toggleTextError = (inputIndex) => {
      return {
          display: this.state.errors[inputIndex] ? "block" : "none",
      }
  }

  setAddress = (data) => { // data:{result:"success", address}
    if(data.result !== undefined){
      var newErrors = this.state.errors;
      if(data.result === "success"){
        console.log("In permitted range");
        newErrors[1] = false;
        this.setState({errors: newErrors, customerAddress: data.address});
      }
      else{
        //alert("Out of permitted range (take more than 30 minutes to deliver)");
        newErrors[1] = true;
        this.setState({errors: newErrors})
      }
    }
  }

  render() {
    const {ordersInARow} = this.state;
    return (
        <Dialog id="placeOrderDialog" open={this.props.open} maxWidth="lg">
            <DialogTitle id="customized-dialog-title" onClose={this.onClose}>
                <div className="col-9 text-center text-top border border-danger rounded pt-2 mb-4"
                    style={{display: ordersInARow.length > 0  ? "" : "none"}}>
                    <h6>Last order is automatically requested delivery in &nbsp; 
                        {ordersInARow.length > 0 ? ordersInARow[0].remainingTime: -1} {/* Don't care if it is null */} 
                        seconds&nbsp;
                        <button className="btn btn-primary" onClick={this.checkOut}>Check-out (1)</button>&nbsp;
                        <button className="btn btn-danger" onClick={this.clearOrder}>Cancel</button>
                    </h6>
                </div>
                PLACE ORDER <span><h6>(Maximum 2 orders at a time)</h6></span>
            </DialogTitle>
            <div className="container" style={{display:"contents"}}>
                <div className="row">
                    <div className="col">
                        <div className="container" style={{padding: "0 25px 25px 25px", minWidth: "40vw"}}>
                            <form onSubmit={this.handleSubmit}>
                                <div className="row mt-3">
                                    <div className="col font-weight-bold">Customer Information</div>
                                </div>
                                <div className="row">
                                    <div className="col-3 pt-1">Name: </div>
                                    <div className="col-8">
                                        <input style={this.toggleError(0)} className="form-control" 
                                            name="customerName" value={this.state.customerName} onChange={this.handleOnChange}/>
                                        <small style={this.toggleTextError(0)} className="input-error form-text text-muted">
                                            Customer name cannot be empty
                                        </small>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-3 pt-1">Address: </div>
                                    <div className="col-8">
                                        {/* <input style={this.toggleError(1)} className="form-control"
                                            name="customerAddress" value={this.state.customerAddress} onChange={this.handleOnChange}/> */}
                                        <LocationSearchInput toggleError={this.toggleError(1)} 
                                                            setAddress={this.setAddress} resetPlaceOrder={this.state.reset}/>
                                        <small style={this.toggleTextError(1)} className="input-error form-text text-muted">
                                            Invalid address or out of service range
                                        </small>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col-3 pt-1">Phone #: </div>
                                    <div className="col-8">
                                        <input style={this.toggleError(2)} className="form-control"
                                            name="customerPhone" value={this.state.customerPhone} onChange={this.handleOnChange}/>
                                        <small style={this.toggleTextError(2)} className="input-error form-text text-muted">
                                            Empty or US phone number format is not regconized. Format: 123-123-4567 or 1231234567
                                        </small><br/>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col font-weight-bold">
                                        Order summary:
                                    </div>
                                </div>
                                <div className="row pl-3">
                                    <table className="col-11">{this.renderOrderedItems()}</table>
                                </div>
                                <div className="row mt-3">
                                    <div className="col font-weight-bold">
                                        Customer notes:
                                    </div>
                                </div>
                                <div className="row pl-3">
                                    <div className="col-11">
                                        <TextField multiline fullWidth/>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="container border border-primary" style={{maxWidth: "32vw"}}>
                                        <div className="row">
                                            <div className="col text-uppercase font-weight-bold"> Payment method </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 pt-1">Card number: </div>
                                            <div className="col-8">
                                                <input className="form-control" style={this.toggleError(3)} name="cardNumber" maxLength="16"
                                                    value={this.state.cardNumber} onChange={this.handleOnChange}/>
                                                <small style={this.toggleTextError(3)} className="input-error form-text text-muted">
                                                    Invalid card number
                                                </small><br/>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 pt-1">Expiration : </div>
                                            <div className="col-3">
                                                <input className="form-control" style={this.toggleError(4)} name="cardExpirationM" maxLength="2"
                                                    placeholder="MM" value={this.state.cardExpirationM} onChange={this.handleOnChange}/>
                                                <small style={this.toggleTextError(4)} className="input-error form-text text-muted">
                                                    Invalid card expiration month
                                                </small>
                                            </div>
                                            <div className="col-1" style={{margin:"0 -2vw"}}>/</div>
                                            <div className="col-3">
                                                <input className="form-control" style={this.toggleError(5)} name="cardExpirationY" maxLength="2"
                                                    placeholder="YY" value={this.state.cardExpirationY} onChange={this.handleOnChange}/>
                                                <small style={this.toggleTextError(5)} className="input-error form-text text-muted">
                                                    Invalid card expiration year
                                                </small><br/>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-4 pt-1">CCV : </div>
                                            <div className="col-3">
                                                <input className="form-control" style={this.toggleError(6)} name="cardCCV" maxLength="3"
                                                    value={this.state.cardCCV} onChange={this.handleOnChange}/>
                                                <small style={this.toggleTextError(6)} className="input-error form-text text-muted">
                                                    Invalid card CCV
                                                </small><br/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="row mt-3">
                                    <div className="col text-right mr-5">
                                        <button className="btn btn-secondary" onClick={this.continueToPlaceOrder}>
                                                Continue to place order
                                        </button> &nbsp;
                                        <button type="submit" className="btn btn-primary">
                                            Check-out ({ordersInARow.length > 0 ? 2 : 1}) 
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="col">
                        <Menu updateOrder={this.updateOrder} resetMenu={this.state.reset}/>
                    </div>
                </div>
            </div>
        </Dialog>
    )
  }
}

export default PlaceOrder