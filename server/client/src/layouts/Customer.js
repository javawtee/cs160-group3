import React, { Component } from 'react';
import {Link} from "react-router-dom";
import {TextField, InputAdornment, IconButton } from "@material-ui/core";
import SearchIcon from '@material-ui/icons/Search';

import CustomerDialog from "./dialog/CustomerDialog";

export class Customer extends Component {
    state = {
        searchText: '',
        searched: false,
        customerDialog: false,
    }
    handleCustomerLogin = this.handleCustomerLogin.bind(this)
    handleCustomerDialogClose = this.handleCustomerDialogClose.bind(this)
    handleOnChange = this.handleOnChange.bind(this)
    searchSubmit = this.searchSubmit.bind(this)

    handleCustomerLogin(e){
        e.preventDefault()
        this.setState({customerDialog: true})
    }

    handleCustomerDialogClose(){
        this.setState({customerDialog: false})
    }

    handleOnChange(e){
        this.setState({[e.target.name] : e.target.value})
    }

    searchSubmit(e){
        e.preventDefault();
        alert("searched");
        this.setState({searched: true})
    }
  render() {
      const {searchText, searched, customerDialog} = this.state
    return (
      <div style={{margin: "-20% -10%"}}>
        <div className="row">
            <Link to="/login">Login</Link> &nbsp;
            to place order and review
        </div>
        <div className="row">
            <form className="col-12" onSubmit={this.searchSubmit} >
                <TextField
                    id="outlined-search-input"
                    label="Search for restaurant and food"
                    name="searchText"
                    margin="normal"
                    variant="outlined"
                    value={searchText} 
                    onChange={this.handleOnChange} 
                    fullWidth={true}
                    InputProps={{
                        endAdornment: 
                        <InputAdornment position="end">
                            <IconButton style={{padding: 10}} aria-label="Search" type="submit">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>,
                    }}
                />
            </form>
        </div>

        <div className="container" style={{display: searched ? "block" : "none", textAlign: "left" }}>
            <div className="row p-4 border">
                <div className="col-3 pt-4">
                    <img className="mx-auto img-fluid" src="/media/mcdonalds.jpg" alt="mcdonalds" />
                </div>
                <div className="col-md-auto">
                    <Link to="/">Restaurant Name</Link><br/>
                    Seafood restaurant<br/>
                    Address: 123 ABCXYZ, San Jose, CA 95xxx <br />
                    Business hours: bla bla <br />
                    Website: ... <br />
                    Rating: 5 stars <br />
                    <Link className="btn btn-secondary" to="/">Place order</Link> 
                </div>
            </div>
        </div>
        <CustomerDialog open={customerDialog} onClose={this.handleCustomerDialogClose} />
      </div>
    )
  }
}

export default Customer
