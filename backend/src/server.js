const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')
const mail = require('./mail')

const multipart = require('connect-multiparty')

const cors = require('cors')
const jwt = require('jsonwebtoken')
const moment = require('moment')

const bcrypt = require('bcrypt')
const saltRounds = 10

const PORT = process.env.PORT || 3128

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('appSecret', 'secretforproject')

// Multiparty Middleware
const multipartMiddleware = multipart()

function isEmpty(str) {
    return !str || 0 === str.length
}

app.post('/register', multipartMiddleware, async (req, res) => {
    try {
        if (
            isEmpty(req.body.forename) ||
            isEmpty(req.body.surname) ||
            isEmpty(req.body.email) ||
            isEmpty(req.body.password)
        ) {
            return res.json({
                status: false,
                message: 'All fields are required',
            })
        }

        const email_in_use = await db.qry('SELECT * FROM users WHERE email = ?', [
            req.body.email,
        ])

        const prev_id = await db.qry('SELECT MAX(user_id) AS value FROM users')

        if (!email_in_use.length) {
            const hash = await bcrypt.hash(req.body.password, saltRounds)

            const user = {
                user_id: prev_id[0].value + 1,
                forename: req.body.forename,
                surname: req.body.surname,
                email: req.body.email,
                password: hash,
                account_creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                last_login_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                verified: 0,
            }

            await db.qry('INSERT INTO users SET ?', [user])
            delete user.password

            await mail.newRegisterEmailConfirmation(user)

        } else {
            await mail.newRegisterEmailWarning(email_in_use[0])
        }

        const users = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])
        const user = users[0]

        return res.json({
            status: true,
            user,
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
                message: 'Wrong email or password',
            })
        }
        const user = users[0]
        
        const authenticated = await bcrypt.compareSync(req.body.password, user.password)
        delete user.password
        const verified = user.verified

        if (authenticated && verified) {

            await db.qry('UPDATE users SET last_login_date = ? WHERE user_id = ?', [
                moment().format('YYYY-MM-DD HH:mm:ss'),
                user.user_id,
            ])

            const payload = { user }
            const token = jwt.sign(payload, app.get('appSecret'), {
                expiresIn: '24h',
            })

            return res.json({
                status: true,
                user,
                token,
            })
        } else {
            return res.json({
                status: false,
                message: 'Wrong email or password',
            })
        }
    } catch (error) {
        throw error
    }
})

app.post('/forgottenPassword', multipartMiddleware, async (req, res) => {
    try {
        const users = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])
        if (!users.length) {
            return res.json({
                status: false,
            })
        }
        const user = users[0]
        delete user.password
        const verified = user.verified

        if (verified) {
            const prev_id = await db.qry('SELECT MAX(id) AS value FROM password_reset_requests')

            const request = {
                id: prev_id[0].value + 1,
                user_id: user.user_id,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry('UPDATE password_reset_requests SET valid = 0 WHERE user_id = ?', [
                user.user_id
            ])

            await db.qry('INSERT INTO password_reset_requests SET ?', [request])

            return res.json({
                status: true,
            })
        } else {
            return res.json({
                status: false,
            })
        }
    } catch (error) {
        throw error
    }
})

app.post('/changeEmail', multipartMiddleware, async (req, res) => {
    try {
        const usersA = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])

        if (!usersA.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }
        const user = usersA[0]

        const authenticated = await bcrypt.compareSync(req.body.password, user.password)
        delete user.password

        if (!authenticated) {
            return res.json({
                status: false,
                message: 'Wrong password',
            })
        }

        if (req.body.new_email === user.email) {
            return res.json({
                status: false,
                message: 'This is already your email address',
            })
        }

        const usersB = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.new_email])
        if (usersB.length) {
            await mail.newChangeEmailWarning(usersB[0])
        } else {
            await mail.newChangeEmailConfirmation(user)
            await db.qry('UPDATE users SET requested_email = ? WHERE user_id = ?', [
                req.body.new_email,
                user.user_id
            ])
        }

        // TODO: UPDATE EMAIL ADDRESS => MOVE TO EMAIL CHANGE CONFIRMATION PAGE

        // await db.qry('UPDATE users SET email = ? WHERE user_id = ?', [
        //     req.body.new_email,
        //     user.user_id
        // ])

        return res.json({
            status: true,
        })

    } catch (error) {
        throw error
    }
})

app.post('/changePassword', multipartMiddleware, async (req, res) => {
    try {
        const users = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])
        if (!users.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }
        const user = users[0]

        const authenticated = await bcrypt.compareSync(req.body.current_password, user.password)
        delete user.password
        const verified = user.verified

        if (authenticated && verified) {

            const hash = await bcrypt.hash(req.body.new_password, saltRounds)

            await db.qry('UPDATE users SET password = ? WHERE user_id = ?', [
                hash,
                user.user_id
            ])

            return res.json({
                status: true,
            })

        } else {
            return res.json({
                status: false,
                message: 'Wrong password',
            })
        }
    } catch (error) {
        throw error
    }
})

app.post('/deleteAccount', multipartMiddleware, async (req, res) => {
    try {
        const users = await db.qry('SELECT * FROM users WHERE email = ?', [req.body.email])
        if (!users.length) {
            return res.json({
                status: false,
                message: 'Wrong email or password',
            })
        }
        const user = users[0]
        const authenticated = await bcrypt.compareSync(req.body.password, user.password)
        delete user.password
        const verified = user.verified

        if (authenticated && verified) {

            await db.qry('DELETE FROM users WHERE user_id = ?', [
                user.user_id
            ])

            return res.json({
                status: true,
            })
        } else {
            return res.json({
                status: false,
                message: 'Wrong email or password',
            })
        }
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
    res.send('<h1>Welcome to my project</h1>')
})

app.listen(PORT, () => {
    console.log(`App running on localhost:${PORT}`)
})
