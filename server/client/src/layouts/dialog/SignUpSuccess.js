import React, { Component } from 'react'
import { Dialog} from '@material-ui/core';

export class SignUpSuccess extends Component {
  render() {
    const {onClose, ...other} = this.props;
    return (
        <Dialog id="signUpDialog" {...other}>
            <div className="row" style={{padding: "55px"}}>
                <div className="col">
                    <h4>SUBMITTED SIGN-UP FORM SUCCESSFULLY</h4>
                    <hr/>
                    <div>
                        Your form will be reviewed soon...<br/>
                        Upon its approval, you will be notified via your registered email<br/>
                        and your account is eligible to login
                    </div>
                </div>
                <div className="w-100"></div>
                <div className="col">
                    <br/>
                    <br/>
                    <button className="btn btn-primary" onClick={onClose}>Close</button>
                </div>
            </div>
        </Dialog>
    )
  }
}

export default SignUpSuccess
