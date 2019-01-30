const { NODE_ENV, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = require('./config')

var mysql = require('mysql')
var connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
})

connection.connect()

const res = connection.query('SELECT * from test', function(error, results, fields) {
    if (error) throw error
    console.log(JSON.stringify(results))
    console.log(results[0])
    console.log(results[0].student_id)
})

connection.end()
