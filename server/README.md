How to run a test<br>

<b>Set up</b><br>
Open cmd / Terminal, type following command in order<br>
 1. cd client && npm install
 2. cd ..
 3. npm install
 
<b>Configure app.js in server directory<b><br>
 - change const mysql to match MySQL in your local
 - change connection.query to match your needs
 - There should be rows in your local MySQL in order to test
 
 <b>Run</b><br>
  1. Run concurrently
  - In cmd/ Terminal, type: npm run dev
  2. Run separate hosts:
  - React on port 3000
  - Express on port 5000
  - Start Express: In cmd/Terminal, type: npm start (make sure you are at server directory, not client)
  - Start React: Open new cmd/Terminal, type: cd client && npm start
 
 <b>Test</b><br>
  1. Enter user_id and password, then click or hit Enter key
  Expectations: <br>
  - If matched, "Not login yet" should change to matched record of username
  - Else, "Not login won't change"
