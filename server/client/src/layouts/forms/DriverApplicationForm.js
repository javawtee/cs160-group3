import React, { Component } from 'react'
import TextField from '@material-ui/core/TextField'

export class DriverApplicationForm extends Component {
  render() {
    return (
      <div>
        <div style={{textAlign: 'left', paddingLeft: '5px'}}>
            Requirements:<br/>
            - At least 21 years old<br/>
            - Have access to a licensed car <br/>
            - Have a valid driver license <br/>
            <hr/>
        </div>
        <table style={{width: '100%'}}>
            <tr>
                <td>Full name: </td>
                <td><TextField placeholder='Last, First (Doe John)' /></td>
            </tr>
            <tr>
                <td>Phone number: </td>
                <td><TextField /></td>
            </tr>
            <tr>
                <td>Email: </td>
                <td><TextField /></td>
            </tr>
            <tr>
                <td style={{width: '40%'}}>Vehicle Model Year, Make and Model: </td>
                <td><TextField placeholder='2018 Honda Civic'/></td>
            </tr>
        </table>
        <div>Upload your driver license:</div>
        <div>Upload function goes here</div>
        <button>Submit</button>
      </div>
    )
  }
}

export default DriverApplicationForm
