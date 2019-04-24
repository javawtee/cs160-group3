import React, { Component } from 'react'
import { Dialog} from '@material-ui/core';

import LoginForm from "../forms/LoginForm";
import CustomerForm from "../forms/CustomerForm";

export class CustomerDialog extends Component {
  state = {
    signUp: false,
  }
  handleCustomerSignUp = this.handleCustomerSignUp.bind(this)

  handleCustomerSignUp(e){
    e.preventDefault()
    this.setState({signUp: true})
  }

  render() {
    const {...other} = this.props;
    return (
        <Dialog id="customerDialog" {...other}>
            <div className="row" style={{padding: "55px"}}>
                <div className="col" style={{display: this.state.signUp? "none" : "block"}}>
                    <LoginForm who="customer" handleCustomerSignUp={this.handleCustomerSignUp}/> 
                </div>
                <div className="col" style={{display: this.state.signUp? "block" : "none"}}>
                    <CustomerForm />
                </div>
            </div>
        </Dialog>
    )
  }
}

export default CustomerDialog
