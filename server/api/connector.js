const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  database: 'testdb'
})

connection.connect((err) => {
  if(err) console.log('Welcome to Express JS. You are disconnected')
  else console.log('Welcome to Express JS. You are connected')
})

module.exports = connection;