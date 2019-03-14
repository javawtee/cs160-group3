import React, { Component } from 'react'

import zxcvbn from "zxcvbn";

/*  
  zxcvbn.score      # Integer from 0-4 (useful for implementing a strength bar)

  0 # too guessable: risky password. (guesses < 10^3)

  1 # very guessable: protection from throttled online attacks. (guesses < 10^6)

  2 # somewhat guessable: protection from unthrottled online attacks. (guesses < 10^8)

  3 # safely unguessable: moderate protection from offline slow-hash scenario. (guesses < 10^10)

  4 # very unguessable: strong protection from offline slow-hash scenario. (guesses >= 10^10)
*/

const emailRegex = 	
/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const USPhoneNumberRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export class Validate extends Component {
  notEmpty = (value) =>{
    return value.length > 0;
  }

  validPassword = (value) => {
    return value.length > 6 && zxcvbn(value).score > 1; 
  }

  validConfirmPassword = (original, confirm) => {
    return confirm.length > 0 && original === confirm;
  }

  validEmailFormat = (value) => {
    return emailRegex.test(value)
  }

  validUSPhoneNumberFormat = (value) => {
    return USPhoneNumberRegex.test(value)
  }

  componentDidMount(){
    this.props.onRef(this);
  }

  componentWillUnmount(){
    this.props.onRef(undefined);
  }

  render() {
    return (
      <React.Fragment>
        
      </React.Fragment>
    )
  }
}

export default Validate

