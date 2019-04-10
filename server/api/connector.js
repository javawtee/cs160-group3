const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testdb'
})

connection.connect((err) => {
  if(err) console.log('Welcome to Express JS. You are disconnected ' + err) 
  else console.log('Welcome to Express JS. You are connected')
})

module.exports = connection;