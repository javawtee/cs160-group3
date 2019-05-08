import React, { Component } from 'react';

import LocationSearchInput from "../../components/LocationSearchInput";
import Validate from "../../components/Validate";

const initState = userInfo => {
    return {
        userName: userInfo.userName,
        joinedDate: userInfo.approvedDate,
        phoneNumber: userInfo.phoneNumber,
        email: userInfo.email,
        address: userInfo.address,
        editable: false,
        oldPassword: "",
        verified: false,
        newPassword: "",
        confirmNewPassword: "",
        errors: [false,false,false,false,false],
        revert: false, // indicate to revert address in LocationSearchInput
        updateDelay: 30 * 60 * 1000 // delay 30 minutes between updates
    }
}

export class UserInformation extends Component {
    constructor(props){
        super(props);
        this.userInfo = () => { return JSON.parse(sessionStorage.getItem("user-token")) };
        this.state = initState(this.userInfo());
    }
    toggleEditable = this.toggleEditable.bind(this)
    handleSubmit = this.handleSubmit.bind(this)

    toggleEditable(e){
        e.preventDefault();
        var lastUpdatedTime = (new Date()).getTime() - JSON.parse(sessionStorage.getItem("user-token")).lastInfoUpdated
        if(lastUpdatedTime < this.state.updateDelay){
            alert("Can't edit information continuously. Wait for " + 
                    (Math.floor((this.state.updateDelay - lastUpdatedTime)/(60 * 1000))) + " minute(s)");
            return
        }
        this.setState((prevState) => ({
          editable: !prevState.editable,
          oldPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }))
      }
    
      handleOnChange = (e) => {
        var newErrors = this.state.errors;
        switch(e.target.name){
            case "newPassword":
            case "confirmNewPassword":
                newErrors[0] = false;
                newErrors[1] = false;
                break; 
            case "phoneNumber":
                newErrors[2] = false;
                break;
            case "email":
                newErrors[3] = false;
                break;
            case "address":
                newErrors[4] = false;
                break;
            default:
                break;
        }
        this.setState({[e.target.name]: e.target.value, errors: newErrors})
      }
    
      verifyPassword = (e) => {
        e.preventDefault();
        const uuid = JSON.parse(sessionStorage.getItem("user-token")).uuid;
        const oldPassword = this.state.oldPassword;
        fetch("/user/edit-information", 
          {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({uuid, oldPassword})
        })
        .then(res => res.json())
        .then(result => {
            if(result !== "verified")
                alert("Password is incorrect")
            else{
                const errors = [false,false,false,false,false]
                this.setState({oldPassword, verified: true, errors})
            }
        })
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
    
      handleSubmit(e){
        e.preventDefault();
        const uuid = JSON.parse(sessionStorage.getItem("user-token")).uuid;
        const {oldPassword, newPassword, confirmNewPassword, address, phoneNumber, email} = this.state
        var newErrors = this.state.errors; // by using clone ==> avoid state mutation in React-pattern
        newErrors[0] = newPassword.length > 0 && !Validate.validPassword(newPassword); // true: length > 6 and strength score > 1 ==> newErrors[0] = false
    
        newErrors[1] = newPassword.length > 0 && !Validate.validConfirmPassword(newPassword, confirmNewPassword); // true: matched ==> newErrors[1] = false
    
        newErrors[2] = !Validate.validUSPhoneNumberFormat(phoneNumber); // true: valid ==> newErrors[2] = false
    
        newErrors[3] = !Validate.validEmailFormat(email); // true: valid ==> newErrors[3] = false
    
        if(address !== null){
            newErrors[4] = newErrors[4] || !Validate.notEmpty(address); // true: notEmpty ==> newErrors[4] = false
        } else {
            newErrors[4] = false;
        }

        if(newErrors.filter(error => error === true).length > 0) // has any error, stop submitting
          this.setState({ errors: newErrors });
        else {
            fetch("/user/edit-information", 
            {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({uuid, oldPassword, newPassword, address, phoneNumber, email})
            })
            .then(res => res.json())
            .then(result => {
                if(result !== "success") alert("Can't update information right now. Something goes wrong")
                else {
                    //update userToken
                    var newUserInfo = this.userInfo();
                    newUserInfo.phoneNumber = phoneNumber;
                    newUserInfo.email = email;
                    newUserInfo.address = address;
                    newUserInfo.lastInfoUpdated = (new Date()).getTime(); // to prevent user from editing info continuously
                    sessionStorage.setItem("user-token", JSON.stringify(newUserInfo));

                    //update local token
                    var local = JSON.parse(localStorage.getItem("user-token"));
                    var expiration = local.expiration;
                    newUserInfo.expiration = expiration;
                    localStorage.setItem("user-token", JSON.stringify(newUserInfo));

                    this.setState(initState(this.userInfo()));
                }
            }) // whenever setState is called, this component will be re-rendered
        }
    }

    formatDate = date => {
        var temp = new Date(Date.parse(date));
        var formattedDate = `${temp.getMonth()}/${temp.getDate()}/${temp.getFullYear()}
                             ${temp.getHours()}:${temp.getMinutes()}:${temp.getSeconds()}`;
        return <>{formattedDate}</>
    }

    setAddress = (data) => { // data:{result:"success", address}
        if(data.result !== undefined){
            var newErrors = this.state.errors;
            if(data.result === "success"){
                console.log("Address is valid. Within Santa Clara County");
                newErrors[4] = false;
                // update geocode for restaurant

                this.setState({errors: newErrors, address: data.address});
            }
            else{
                console.log("Address is invalid. Outside Santa Clara County");
                newErrors[4] = true;
                this.setState({errors: newErrors})
            }
        }
    }
  render() {
      const { userName, address, phoneNumber, email, joinedDate, 
        editable, verified, oldPassword, newPassword, confirmNewPassword} = this.state;
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
            <table className="col user-table">
                <tbody>
                    <tr>
                        <td width="24%">Name: </td>
                        <td className="text-uppercase">
                            {userName}
                        </td>
                    </tr>             
                    <tr>
                        <td> Joined date: </td>
                        <td>
                            {this.formatDate(joinedDate)}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <a className="btn btn-info" href="user/edit-information" onClick={this.toggleEditable}> 
                                Edit information
                                <img src="/media/edit-icon.png" alt="pencil" height="4%" width="8%"/>
                            </a>
                        </td>
                        <td style={{visibility: (editable && !verified) ? "visible": "hidden"}}>
                            Enter your password:&nbsp;
                            <input type="password" name="oldPassword" value={oldPassword}
                                onChange={this.handleOnChange} maxLength="32"/> &nbsp;
                            <button className="btn btn-primary" onClick={this.verifyPassword}>Verify</button>
                        </td>
                    </tr>
                    <tr>
                        <td colSpan="2"><hr/></td>
                    </tr>
                    <tr style={{display: verified ? "": "none"}}>
                        <td>New password: </td>
                        <td>
                            <input className="form-control text-left text-truncate" style={this.toggleError(0)} type="password" name="newPassword" 
                                value={newPassword} onChange={this.handleOnChange} maxLength="32"/>
                            <small style={this.toggleTextError(0)} className="input-error form-text text-muted">
                                Min: 6 characters or too simple
                            </small>
                        </td>
                    </tr>
                    <tr style={{display: verified ? "": "none"}}>
                        <td>Confirm new password: </td>
                        <td>
                            <input className="form-control text-left text-truncate" style={this.toggleError(1)} type="password" name="confirmNewPassword" value={confirmNewPassword}
                                onChange={this.handleOnChange} maxLength="32"/>
                            <small style={this.toggleTextError(1)} className="input-error form-text text-muted">
                                Confirm password is not matching
                            </small>
                        </td>
                    </tr>
                    <tr>
                        <td>Phone Number: </td>
                        <td>
                            <input className="form-control text-left text-truncate" style={this.toggleError(2)} name="phoneNumber" type="text" 
                                readOnly={verified? false : true} value={phoneNumber} onChange={this.handleOnChange} autoComplete="new-password"
                                maxLength="10"/>
                            <small style={this.toggleTextError(2)} className="input-error form-text text-muted">
                            Empty or US phone number format is not regconized. Format: 123-123-4567 or 1231234567
                            </small>
                        </td>
                    </tr>
                    <tr>
                        <td>Email: </td>
                        <td>
                            <input className="form-control text-left text-truncate" style={this.toggleError(3)} name="email" type="text" 
                                readOnly={verified? false : true} value={email} onChange={this.handleOnChange} autoComplete="new-password"/>
                            <small style={this.toggleTextError(3)} className="input-error form-text text-muted">
                            Empty or email format is not regconized. Format: example@domain.com
                            </small>
                        </td>
                    </tr>
                    <tr style={{display: address !== null ? "" : "none"}}>
                        <td>Address: </td>
                        <td>
                            <LocationSearchInput isReadOnly={verified? false : true} 
                                toggleError={this.toggleError(4)}
                                setAddress={this.setAddress}
                                presetValue={address || ""}
                                revert={this.state.revert}
                                updateRestaurantAddress ={address !== null}
                            />
                            <small style={this.toggleTextError(4)} className="input-error form-text text-muted">
                                Invalid address or out of service range
                            </small>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="w-100 mt-2"></div>
            <div className="col" style={{display: verified ? "block": "none", padding: "3% 0"}} >
                &nbsp;
                <button type="submit" className="btn btn-primary">Update</button>
                &nbsp;
                <button type="cancel" className="btn btn-danger"
                    onClick={e => {
                        e.preventDefault();
                        this.setState(initState(this.userInfo()), () => {
                            // toggle revert simutaneously to revert address in LocationSearchInput
                            this.setState({revert:true}, () => {
                                this.setState({revert: false});
                            })
                        });
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
      </div>
    )
  }
}

export default UserInformation
