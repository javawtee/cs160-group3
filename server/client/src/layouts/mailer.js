//      sendEmail = e => {
//          e.preventDefault();
//          if(this.state.email == ''){
//              this.setState({
//                  showError: false,
//                  messageFromServer: '',
//              });
//          } 
//          else{
//          axios
//             .post('http://localhost:3003/forgotPassword', {
//                 email: this.state.email,
//             })
//             .then(response=> {
//                 console.log(response.data);
//                 if(response.data == 'email not in db'){
//                     this.setState({
//                         showError: true, 
//                         messadeFromServer: '',
//                     });

//                 } else if(response.data == 'recovery email sent'){
//                     this.setState({
//                         showError: true, 
//                         messadeFromServer: 'recovery email sent',
//                     });
//                 }
//             })
//             .catch(error => {
//                 console.log(error.data);
//             });


//          }
//     };

  

//     const nodemailer = require('nodemailer')
    
//     app.post('/api/form', (req, res)=> {
//         nodemailer.createTestAccount((err, account) => {
//             const htmlEmail = `
//                 <h3>Contact Details</h3>
//                 <ul>
//                     <li>Name: ${req.body.name}</li>
//                     <li>Email: ${req.body.email}</li>
//                 </ul>
//                 <h3>Message</h3> 
//                 <p>${req.body.message}</p>
//                 `
             
//             let transporter = nodemailer.createTransport({
//                 host: 'smtp.ethereal.mail', 
//                 port: 587, 
//                 auth: {
//                     user: 'monserrat.hoeger@ethereal.email',
//                     pass: 'JfSBZNJkh9pfhMyt22'
//                 }
//             })
    
//             let mailOption = {
//                 from: 'test@testaccount.com',
//                 to: 'monserrat.hoeger@ethereal.email',
//                 replyTo: 'New Message',
//                 text: req.body.message,
//                 html: htmlEmail
            
//             }
    
//             transporter.sendMail(mailOption, (err, info) =>{
//                 if(err) {
//                     return console.log(err)
//                 }
    
//                 console.log('Message sent: %s', info.message)
//                 console.log('Message URL: ', nodemailer.getTestMessageUrl(info))
//             })
                
//         })
//     })



//  }