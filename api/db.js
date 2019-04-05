const mysql = require('mysql')

var connection = mysql.createPool({
    connectionLimit:10,
    host: "us-cdbr-iron-east-03.cleardb.net",
    user: "bce2f9b4bfc9a2",
    password: "84960ad7",
    database: "heroku_f10f3db6c1f027d",
    multipleStatements: true
})

// connection.connect((err)=>{
//     if (err) throw err
//         console.log('Connected to MySQL')
// })

module.exports = connection;