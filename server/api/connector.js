const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '84561379Ab',
  database: 'testdb',
})

connection.connect((err) => {
  if(err) console.log('Welcome to Express JS. You are disconnected\n'+err)
  else console.log('Welcome to Express JS. You are connected')
})

module.exports = connection;
