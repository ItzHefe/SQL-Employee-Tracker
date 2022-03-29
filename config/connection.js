const mysql = require('mysql');
require('dotenv').config();

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
});

module.exports = connection