import React, { Component } from 'react';
import Validate from "../../components/Validate";

export class UserInformation extends Component {
    constructor(props){
        super(props);
        this.userInfo = JSON.parse(sessionStorage.getItem("user-token"));
        this.state = {
            userName: this.userInfo.userName,
            joinedDate: this.userInfo.approvedDate,
            phoneNumber: this.userInfo.phoneNumber,
            email: this.userInfo.email,
            address: this.userInfo.address,
            editable: false,
            oldPassword: "",
            verified: false,
            newPassword: "",
            confirmNewPassword: "",
            errors: [false,false,false,false,false],
            updateDelay: 30 * 60 * 1000 // delay 30 minutes between updates
        }
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
                newErrors[3] = false;
                break;
            default:
                break;
        }
        this.setState({[e.target.name]: e.target.value, errors: newErrors})
      }
    
      verifyPassword = (e) => {
        e.preventDefault();
        console.log(this.userInfo)
        const userId = this.userInfo.userId;
        const oldPassword = this.state.oldPassword;
        fetch("/user/edit-information", 
          {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({userId, oldPassword})
        })
        .then(res => res.json())
        .then(payload => {
            if(payload.numOfResults === 0)
                alert("Password is incorrect")
            else{
                const errors = [false,false,false,false,false]
                this.setState({verified: true, errors})
            }
        }) // whenever setState is called, this component will be re-rendered
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
        const userId = this.userInfo.userId;
        const {oldPassword, newPassword, confirmNewPassword, address, phoneNumber, email} = this.state
        var newErrors = this.state.errors; // by using clone ==> avoid state mutation in React-pattern
        newErrors[0] = newPassword.length > 0 && !Validate.validPassword(newPassword); // true: length > 6 and strength score > 1 ==> newErrors[0] = false
    
        newErrors[1] = newPassword.length > 0 && !Validate.validConfirmPassword(newPassword, confirmNewPassword); // true: matched ==> newErrors[1] = false
    
        newErrors[2] = !Validate.validUSPhoneNumberFormat(phoneNumber); // true: valid ==> newErrors[2] = false
    
        newErrors[3] = !Validate.validEmailFormat(email); // true: valid ==> newErrors[3] = false
    
        newErrors[4] = address !== null && !Validate.notEmpty(address); // true: notEmpty ==> newErrors[4] = false
    
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
                body: JSON.stringify({userId, oldPassword, newPassword, address, phoneNumber, email})
            })
            .then(res => res.json())
            .then(payload => {
                if(payload.numOfResults === 0)
                    alert("Can't update information right now. Something goes wrong")
                else{
                    const errors = [false,false,false,false,false];
                    //update userToken
                    this.userInfo.phoneNumber = phoneNumber;
                    this.userInfo.email = email;
                    this.userInfo.address = address;
                    this.userInfo.lastInfoUpdated = (new Date()).getTime(); // to prevent user from editing info continuously
                    sessionStorage.setItem("user-token", JSON.stringify(this.userInfo));

                    this.setState({editable: false, verified: false, errors});
                }
            }) // whenever setState is called, this component will be re-rendered
        }
    }
  render() {
      const { userName, address, phoneNumber, email, joinedDate, 
        editable, verified, oldPassword, newPassword, confirmNewPassword} = this.state;
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
            <table className="col">
            <tbody>               
                <tr>
                <td width="24%">Joined date: </td>
                <td>
                    {joinedDate}
                </td>
                </tr>
                <tr>
                <td>
                    <a href="user/edit-information" onClick={this.toggleEditable}> 
                    Edit information
                    <img src="/media/edit-icon.png" alt="pencil" height="4%" width="8%"/>
                    </a>
                </td>
                <td style={{visibility: (editable && !verified) ? "visible": "hidden"}}>
                    Enter your password:&nbsp;
                    <input type="password" name="oldPassword" value={oldPassword}
                        onChange={this.handleOnChange}/> &nbsp;
                    <button className="btn btn-primary" onClick={this.verifyPassword}>Verify</button>
                </td>
                </tr>
                <tr>
                <td colSpan="2"><hr/></td>
                </tr>
                <tr className="editable-tr">
                <td>Name: </td>
                <td>
                    {userName}
                </td>
                </tr>
                <tr className="editable-tr" style={{display: verified ? "": "none"}}>
                <td>New password: </td>
                <td>
                    <input style={this.toggleError(0)} type="password" name="newPassword" value={newPassword}
                        onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(0)} className="input-error form-text text-muted">
                    Min: 6 characters or too simple
                    </small>
                </td>
                </tr>
                <tr className="editable-tr" style={{display: verified ? "": "none"}}>
                <td>Confirm new password: </td>
                <td>
                    <input style={this.toggleError(1)} type="password" name="confirmNewPassword" value={confirmNewPassword}
                        onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(1)} className="input-error form-text text-muted">Confirm password is not matching</small>
                </td>
                </tr>
                <tr className="editable-tr">
                <td>Phone Number: </td>
                <td>
                    <input style={this.toggleError(2)} name="phoneNumber" type="text" 
                        readOnly={verified? false : true} value={phoneNumber} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(2)} className="input-error form-text text-muted">
                    Empty or US phone number format is not regconized. Format: 123-123-4567 or 1231234567
                    </small>
                </td>
                </tr>
                <tr className="editable-tr">
                <td>Email: </td>
                <td>
                    <input style={this.toggleError(3)} name="email" type="text" 
                        readOnly={verified? false : true} value={email} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(3)} className="input-error form-text text-muted">
                    Empty or email format is not regconized. Format: example@domain.com
                    </small>
                </td>
                </tr>
                <tr className="editable-tr" style={{display: address !== null ? "block" : "none"}}>
                <td>Address: </td>
                <td>
                    <input style={this.toggleError(4)} name="address" type="text" 
                        readOnly={verified? false : true} value={address !== null ? address : ""} onChange={this.handleOnChange}/>
                    <small style={this.toggleTextError(4)} className="input-error form-text text-muted">Address cannot be empty</small>
                </td>
                </tr>
            </tbody>
            </table>
            <div className="w-100"></div>
            <div className="col" style={{display: verified ? "block": "none", padding: "3% 0"}} >
                &nbsp;
                <button type="submit" className="btn btn-primary">Update</button>
                &nbsp;
                <button type="cancel" className="btn btn-primary"
                    onClick={(e) => {
                        e.preventDefault();
                        const errors = [false,false,false,false,false]
                        this.setState({editable: false, verified: false, errors})
                    }}>
                    Cancel
                </button>
            </div>
        </form>
      </div>
    )
  }
}

export default UserInformation
