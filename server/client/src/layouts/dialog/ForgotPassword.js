import React, { Component } from 'react'
import { Dialog, TextField} from '@material-ui/core';

export class ForgotPassword extends Component {
    constructor(props){
        super(props);
        this.state = {
            userId: "",
            error: false,
        }
    }
    handleSubmit = this.handleSubmit.bind(this)    

    handleOnChange = (e) => {
        this.setState({[e.target.name]: e.target.value})
    }

    handleSubmit(e){
        e.preventDefault();
        const {userId} = this.state
        if(userId.length > 0){
            fetch("/user/exists/" + userId)
            .then(res => res.json())
            .then(payload => {
                if(payload.numOfResults > 0){
                    var to = payload.email;
                    var subject = "SantaClaraDeliveryService - Simple Password Recovery";
                    fetch("/mailer", 
                    {
                        method: "POST",
                        headers: {
                        "Accept": "application/json",
                        "Content-Type": "application/json"
                        },
                        body: JSON.stringify({userId, to, subject})
                    })
                    .then(res => res.json())
                    .then(result => {
                        if(result === "success"){
                            alert("Successfully sent recovery password. If you don't see email. Check Spam box");
                        } else {
                            alert("Failed to send recovery password. Try at another time");
                        }
                        this.props.onClose();
                    })
                } else
                    this.setState({error: true});
            })
        } else
            this.setState({error: true});
    }

    toggleTextError = () => {
        return {
            display: this.state.error ? "block" : "none",
        }
    }
  render() {
    const {...other} = this.props;
    return (
        <Dialog id="forgotPasswordDialog" {...other}>
            <div className="row" style={{padding: "55px"}}>
                <div className="col">
                    <h4>Password Recovery</h4>
                    <div>
                        <form onSubmit={this.handleSubmit}>
                            We will send your password to your registered email <br/>
                            <TextField name="userId" value={this.state.userId} onChange={this.handleOnChange} placeholder="Enter your UserID"
                            onFocus={() => this.setState({userId: "", error:false})} autoFocus autoComplete="off"/> <br/>
                            <small style={this.toggleTextError()} className="input-error form-text text-muted">
                                UserID is not found
                            </small><br/>
                            <button className="btn btn-primary">Send</button>
                        </form>
                    </div>
                </div>
            </div>
        </Dialog>
    )
  }
}

export default ForgotPassword
