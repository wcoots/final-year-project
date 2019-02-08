const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = require('./config')
const mysql = require('mysql')
const pool = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
})

function qry(input_query, input_vars = null) {
    // db.qry('SELECT * FROM users WHERE last_name = "Cooter"')
    // db.qry('SELECT * FROM users WHERE last_name = ?', ['Cooter'])
    return new Promise(async (resolve, reject) => {
        await pool.getConnection(async (error, connection) => {
            if (error) {
                reject(error)
            }
            await connection.query(input_query, input_vars, (error, results, fields) => {
                connection.release()
                if (error) {
                    reject(error)
                }
                resolve(results)
            })
        })
    })
}

module.exports = {
    qry,
}
