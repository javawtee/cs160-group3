var nodemailer = require('nodemailer');

var user = 'cs160group3sjsu@gmail.com'

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user,
    pass: 'sinisterorange13'
  }
});

module.exports = (to, subject, content) => {
    new Promise((resolve, reject) => {
        transporter.sendMail({user, to, subject, content}, function(error, info){
            if (error) {
                reject(error)
            } else {
                resolve(console.log('Email sent: ' + info.response));
            }
        })
    })
}