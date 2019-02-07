const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')

const multipart = require('connect-multiparty')

const cors = require('cors')
const jwt = require('jsonwebtoken')

const bcrypt = require('bcrypt')
const saltRounds = 10

const PORT = process.env.PORT || 3128

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('appSecret', 'secretforinvoicingapp')

// Multiparty Middleware
const multipartMiddleware = multipart()

function isEmpty(str) {
    return !str || 0 === str.length
}

app.post('/register', multipartMiddleware, async (req, res) => {
    try {
        if (
            isEmpty(req.body.first_name) ||
            isEmpty(req.body.surname) ||
            isEmpty(req.body.email) ||
            isEmpty(req.body.password)
        ) {
            return res.json({
                status: false,
                message: 'All fields are required',
            })
        }

        const previous = await db.qry('SELECT COUNT(*) AS count FROM users WHERE email = ?', [
            req.body.email,
        ])
        if (previous[0].count) {
            return res.json({
                status: false,
                message: 'Email already in use',
            })
        }

        const hash = await bcrypt.hash(req.body.password, saltRounds)

        const prev_id = await db.qry('SELECT MAX(id) AS value FROM users')

        await db.qry(
            'INSERT INTO users(id,first_name,surname,email,password) VALUES(?, ?, ?, ?, ?)',
            [prev_id[0].value + 1, req.body.first_name, req.body.surname, req.body.email, hash]
        )

        const user = await db.qry('SELECT id,first_name,surname,email FROM users WHERE id = ?', [
            prev_id[0].value + 1,
        ])
        const payload = {
            user,
        }
        const token = jwt.sign(payload, app.get('appSecret'), {
            expiresIn: '24h',
        })
        return res.json({
            status: true,
            user,
            token,
        })
    } catch (error) {
        throw error
    }
})

app.post('/login', multipartMiddleware, async (req, res) => {
    try {
        const users = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])
        if (!users.length) {
            return res.json({
                status: false,
                message: 'Wrong email',
            })
        }
        const user = users[0]
        const authenticated = await bcrypt.compareSync(req.body.password, user.password)
        delete user.password

        if (authenticated) {
            const payload = { user }
            const token = jwt.sign(payload, app.get('appSecret'), {
                expiresIn: '24h',
            })

            return res.json({
                status: true,
                user,
                token,
            })
        }

        return res.json({
            status: false,
            message: 'Wrong Password, please retry',
        })
    } catch (error) {
        throw error
    }
})

app.use((req, res, next) => {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if (token) {
        jwt.verify(token, app.get('appSecret'), (err, decoded) => {
            if (err) {
                return res.json({
                    success: false,
                    message: 'Failed to authenticate token.',
                })
            } else {
                req.decoded = decoded
                next()
            }
        })
    } else {
        return res.status(403).send({
            success: false,
            message: 'No token provided.',
        })
    }
})

app.get('/', (req, res) => {
    res.send('<h1>Welcome to Invoicing App</h1>')
})

app.listen(PORT, () => {
    console.log(`App running on localhost:${PORT}`)
})
