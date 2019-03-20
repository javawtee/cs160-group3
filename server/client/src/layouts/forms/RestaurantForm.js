import React, { Component } from 'react'

import GRecaptcha from "../../components/GRecaptcha";
import Validate from "../../components/Validate";

export class RestaurantForm extends Component {
  state = {
    userId: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    address: "",
    phoneNumber: "",
    email: "",
    errors: [false, false, false, false, false, false, false]        
  }
  handleOnChange = this.handleOnChange.bind(this)
  handleSubmit = this.handleSubmit.bind(this)

  handleOnChange(e){
    var newErrors = this.state.errors;
    switch(e.target.name){
        case "userId":
          newErrors[0] = false;
          break;
        case "password":
        case "confirmPassword":
          newErrors[1] = false;
          newErrors[2] = false;
          break;
        case "restaurantName":
          newErrors[3] = false;
          break;
        case "address":
          newErrors[4] = false;
          break;
        case "phoneNumber":
          newErrors[5] = false;
          break;
        case "email":
            newErrors[6] = false;
            break;
        default:
            break;
    }
    this.setState({[e.target.name]: e.target.value, errors: newErrors})
}

  handleSubmit(e){
    e.preventDefault();
    const {userId, password, confirmPassword, restaurantName, address, phoneNumber, email} = this.state
    var newErrors = this.state.errors; // by using clone ==> avoid state mutation in React-pattern
    newErrors[0] = !Validate.validUserId(userId); // true: notEmpty ==> newErrors[0] = false

    newErrors[1] = !Validate.validPassword(password); // true: length > 6 and strength score > 1 ==> newErrors[1] = false

    newErrors[2] = !Validate.validConfirmPassword(password, confirmPassword); // true: matched ==> newErrors[2] = false

    newErrors[3] = !Validate.notEmpty(restaurantName); // true: notEmpty ==> newErrors[3] = false

    newErrors[4] = !Validate.notEmpty(address); // true: notEmpty ==> newErrors[4] = false

    newErrors[5] = !Validate.validUSPhoneNumberFormat(phoneNumber); // true: valid ==> newErrors[5] = false

    newErrors[6] = !Validate.validEmailFormat(email); // true: valid ==> newErrors[6] = false

    if(newErrors.filter(error => error === true).length > 0) // has any error, stop submitting
      this.setState({ errors: newErrors });
    else {
        alert("added");
        // fetch("/createAccount/restaurant", 
        //   {
        //   method: "POST",
        //   headers: {
        //     "Accept": "application/json",
        //     "Content-Type": "application/json"
        //   },
        //   body: JSON.stringify({userId, password, restaurantName, address, phoneNumber, email})
        // })
        // .then(res => res.json())
        // .then(payload => {
        // if(payload.numOfResults === 0)
        //   alert("Failed. Can't insert to database")
        // else
        //   alert("successfully created an account")
        //}) // whenever setState is called, this component will be re-rendered
      }
    }

  toggleError = (inputIndex) => {
    return {
        borderColor: this.state.errors[inputIndex] ? "red" : "#ced4da",
    }
  }

  toggleTextError = (inputIndex) => {
      return {
          display: this.state.errors[inputIndex] ? "block" : "none",
      }
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
            <div className="row" style={{padding: "2% 10%"}}>
                <div className="col">
                    <label>User ID:</label>
                    <input style={this.toggleError(0)} type="text" className="form-control" name="userId" autoFocus
                            value={this.state.userId} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(0)} className="input-error form-text text-muted">
                      Min: 6, max: 20 characters or the format is not regconized (no space or !@#$%^&*)
                    </small><br/>

                    <label>Password:</label>
                    <input style={this.toggleError(1)} type="password" className="form-control" name="password" 
                            value={this.state.password} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(1)} className="input-error form-text text-muted">
                      Min: 6 characters or too simple
                    </small><br/>

                    <label>Confirm password:</label>
                    <input style={this.toggleError(2)} type="password" className="form-control" name="confirmPassword" 
                            value={this.state.confirmPassword} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(2)} className="input-error form-text text-muted">Confirm password is not matching</small><br/>

                    <label>Restaurant's name:</label>
                    <input style={this.toggleError(3)} type="text" className="form-control" name="restaurantName" 
                            value={this.state.restaurantName} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(3)} className="input-error form-text text-muted">Restaurant's name cannot be empty</small><br/>

                    <label>Address:</label>
                    <input style={this.toggleError(4)} type="text" className="form-control" name="address"
                            value={this.state.address} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(4)} className="input-error form-text text-muted">Address cannot be empty</small><br/>

                    <label>Phone number:</label>
                    <input style={this.toggleError(5)} type="text" className="form-control" name="phoneNumber"
                            value={this.state.phoneNumber} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(5)} className="input-error form-text text-muted">
                      Empty or US phone number format is not regconized. Format: 123-123-4567 or 1231234567
                    </small><br/>

                    <label>Email:</label>
                    <input style={this.toggleError(6)} type="text" className="form-control" name="email" 
                            value={this.state.email} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(6)} className="input-error form-text text-muted">
                      Empty or email format is not regconized. Format: example@domain.com
                    </small><br/>

                    GRecaptcha is comment blocked <br/>
                    {/* <GRecaptcha /><br/> */}
                    <button className="btn btn-primary" style={{marginTop: "5%"}} type='submit'>Submit</button>
                </div>
            </div>
        </form>
      </div>
    )
  }
}

export default RestaurantForm
