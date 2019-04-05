const mysql = require('mysql')

var connection = mysql.createPool({
    connectionLimit:10,
    host: "localhost",
    user: "root",
    password: "samson",
    database: "scribe_db",
    multipleStatements: true
})

// connection.connect((err)=>{
//     if (err) throw err
//         console.log('Connected to MySQL')
// })

module.exports = connection;