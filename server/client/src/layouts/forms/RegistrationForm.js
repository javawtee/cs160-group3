import React, { Component } from 'react'

import '../../RegistrationForm.css'

export class RegistrationForm extends Component {
  render() {
    return (
      <div>
        <div id='registration-form-container'>
            <ul>
                <li>Step 1</li>
                <li>Step 2</li>
                <li>Step 3</li>
            </ul>
            <div id='registration-content-container'>
                <div id='registration-content'>CONTENT</div>
                <button>NEXT</button>
            </div>
        </div>
      </div>
    )
  }
}

export default RegistrationForm
