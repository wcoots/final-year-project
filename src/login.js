let mysql = require('mysql')
let express = require('express')
let session = require('express-session')
let bodyParser = require('body-parser')
let path = require('path')
require('dotenv').load()
const { NODE_ENV, DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE } = require('./config')

let connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
})

let app = express()
app.use(
    session({
        secret: 'secret',
        resave: true,
        saveUninitialized: true,
    })
)
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.get('/', function(request, response) {
    response.sendFile(path.join(`${__dirname}/login.html`))
})

app.post('/auth', function(request, response) {
    let username = request.body.username
    let password = request.body.password
    if (username && password) {
        connection.query(
            `SELECT * FROM accounts WHERE username = "${username}" AND password = "${password}"`,
            function(error, results, fields) {
                if (error) throw error
                if (results.length) {
                    request.session.loggedin = true
                    request.session.username = username
                    response.redirect('/home')
                } else {
                    response.send('Incorrect Username and/or Password!')
                }
                response.end()
            }
        )
    } else {
        response.send('Please enter Username and Password!')
        response.end()
    }
})

app.get('/home', function(request, response) {
    if (request.session.loggedin) {
        response.send(`Welcome back ${request.session.username}!`)
    } else {
        response.send('Please login to view this page!')
    }
    response.end()
})

app.listen(3000)
