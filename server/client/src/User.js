import React, { Component } from 'react'

export class User extends Component {
  render() {
      // put inside render so the userName will be updated
    var userName = this.props.userName ? this.props.userName : 'Not login yet'
    return (
      <div>
        {'Welcome, ' + userName}
      </div>
    )
  }
}

export default User
