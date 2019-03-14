import React from 'react'

export default function CheckUsername(userName) {
    fetch("/username/exists",
    {
        method: "POST",
        headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
        },
        body: JSON.stringify({userName})
    })
    .then(res => res.json())
    .then(payload => {
    if(payload.numOfResults === 0)
        alert("username exists // send back a checked mark")
    else
        alert("successfully created an account // send back a checked mark")
        //this.setState({session_username: payload.results[0]})
        //this.setState({userName: payload.results[0]}) //should redirect to UserConsole here
    })

  return (
    <div>
      
    </div>
  )
}
