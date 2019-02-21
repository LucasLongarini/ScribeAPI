const mysql = require('mysql')

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "scribe"
})

connection.connect((err)=>{
    if (err) throw err
    console.log('Connected to MySQL')
})

module.exports = connection;