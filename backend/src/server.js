const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')
const mail = require('./mail')

const multipart = require('connect-multiparty')

const cors = require('cors')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')

const bcrypt = require('bcrypt')
const saltRounds = 10

// const PORT = process.env.PORT || 3128
const PORT = 3000

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

        const prev_user_id = await db.qry('SELECT MAX(user_id) AS value FROM users')

        if (!email_in_use.length) {
            const hash = await bcrypt.hash(req.body.password, saltRounds)

            const user = {
                user_id: prev_user_id[0].value + 1,
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

            const prev_request_id = await db.qry('SELECT MAX(id) AS value FROM sign_up_requests')
            const token_val = await crypto.randomBytes(20)
            const token = token_val.toString('hex')

            const request = {
                id: prev_request_id[0].value + 1,
                user_id: prev_user_id[0].value + 1,
                token,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                token_expiration: moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry('UPDATE sign_up_requests SET valid = 0 WHERE user_id = ?', [
                user.user_id
            ])

            await db.qry('INSERT INTO sign_up_requests SET ?', [request])

            await mail.newRegisterEmailConfirmation(user, token)

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

app.post('/verifyNewAccount', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry('SELECT * FROM sign_up_requests WHERE token = ? AND token_expiration > DATE(NOW()) AND valid = 1 AND completed = 0', [req.body.new_account_token])
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        await db.qry('UPDATE users SET verified = 1 WHERE user_id = ?', [
            request.user_id
        ])

        await db.qry('UPDATE sign_up_requests SET valid = 0, completed = 1, completed_date = ? WHERE token = ?', [
            moment().format('YYYY-MM-DD HH:mm:ss'),
            req.body.new_account_token
        ])

        return res.json({
            status: true,
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
            const token_val = await crypto.randomBytes(20)
            const token = token_val.toString('hex')

            const request = {
                id: prev_id[0].value + 1,
                user_id: user.user_id,
                token,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                token_expiration: moment().add(1, 'hour').format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry('UPDATE password_reset_requests SET valid = 0 WHERE user_id = ?', [
                user.user_id
            ])

            await db.qry('INSERT INTO password_reset_requests SET ?', [request])

            await mail.newPasswordResetRequest(user, token)

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

app.post('/verifyPasswordResetToken', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry('SELECT * FROM password_reset_requests WHERE token = ? AND token_expiration > DATE(NOW()) AND valid = 1 AND completed = 0', [req.body.reset_token])
        if (requests.length) {
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

app.post('/resetPassword', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry('SELECT * FROM password_reset_requests WHERE token = ? AND token_expiration > DATE(NOW()) AND valid = 1 AND completed = 0', [req.body.reset_token])
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        const users = await db.qry('SELECT * FROM users WHERE user_id = ?', [request.user_id])
        if (!users.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }
        const hash = await bcrypt.hash(req.body.new_password, saltRounds)

        await db.qry('UPDATE users SET password = ? WHERE user_id = ?', [
            hash,
            users[0].user_id
        ])

        await db.qry('UPDATE password_reset_requests SET valid = 0, completed = 1, completed_date = ? WHERE token = ?', [
            moment().format('YYYY-MM-DD HH:mm:ss'),
            req.body.reset_token
        ])

        return res.json({
            status: true,
        })

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

        // this is done after password check to maintain security
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
            const prev_request_id = await db.qry('SELECT MAX(id) AS value FROM email_change_requests')
            const token_val = await crypto.randomBytes(20)
            const token = token_val.toString('hex')

            const request = {
                id: prev_request_id[0].value + 1,
                user_id: user.user_id,
                requested_email: req.body.new_email,
                token,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                token_expiration: moment().add(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry('UPDATE email_change_requests SET valid = 0 WHERE user_id = ?', [
                user.user_id
            ])

            await db.qry('INSERT INTO email_change_requests SET ?', [request])

            user.email = req.body.new_email

            await mail.newChangeEmailConfirmation(user, token)
        }

        return res.json({
            status: true,
            message: `A confirmation email has been sent to ${req.body.new_email}`
        })

    } catch (error) {
        throw error
    }
})

app.post('/verifyNewEmail', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry('SELECT * FROM email_change_requests WHERE token = ? AND token_expiration > DATE(NOW()) AND valid = 1 AND completed = 0', [req.body.new_email_token])
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        await db.qry('UPDATE users SET email = ? WHERE user_id = ?', [
            request.requested_email,
            request.user_id
        ])

        await db.qry('UPDATE email_change_requests SET valid = 0, completed = 1, completed_date = ? WHERE token = ?', [
            moment().format('YYYY-MM-DD HH:mm:ss'),
            req.body.new_email_token,
        ])

        await db.qry('UPDATE email_change_requests SET valid = 0 WHERE requested_email = ?', [
            request.requested_email,
        ])

        return res.json({
            email: request.requested_email,
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
    console.log(`App running on port ${PORT}`)
})
