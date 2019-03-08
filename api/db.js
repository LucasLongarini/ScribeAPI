const mysql = require('mysql')

var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "password",
    database: "scribe",
    multipleStatements: true
})

// console.log(process.env.db_host)
// console.log(process.env.db_user)
// console.log(process.env.db_password)
// console.log(process.env.db_database)

connection.connect((err)=>{
    if (err) throw err
        console.log('Connected to MySQL')
})

module.exports = connection;