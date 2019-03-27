const express = require('express')
const bodyParser = require('body-parser')

const db = require('./db')
const mail = require('./mail')

const multipart = require('connect-multiparty')

const cors = require('cors')
const jwt = require('jsonwebtoken')
const moment = require('moment')
const crypto = require('crypto')
const _ = require('lodash')

const bcrypt = require('bcrypt')
const saltRounds = 10

const PORT = 8080

const app = express()
app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.set('appSecret', 'secretforproject')

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

        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(String(req.body.email).toLowerCase())) {
            return res.json({
                status: false,
                message: 'Invalid email address',
            })
        }

        req.body.email = req.body.email.toLowerCase()

        req.body.forename = _.startCase(_.toLower(req.body.forename.replace(/[^A-Za-z ]+/g, '')))
        req.body.surname = _.startCase(_.toLower(req.body.surname.replace(/[^A-Za-z ]+/g, '')))

        if (!req.body.forename.length || !req.body.surname.length) {
            return res.json({
                status: false,
                message: 'Invalid name',
            })
        }

        const email_in_use = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )

        if (!email_in_use.length) {
            const hash = await bcrypt.hash(req.body.password, saltRounds)

            const user = {
                forename: req.body.forename,
                surname: req.body.surname,
                email: req.body.email,
                password: hash,
                account_creation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                last_login_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry('INSERT INTO users SET ?', [user])
            delete user.password

            const token_val = await crypto.randomBytes(20)
            const token = token_val.toString('hex')

            const user_id = await db.qry(
                `SELECT user_id
                FROM users
                WHERE email = ?`,
                [req.body.email]
            )

            const request = {
                user_id: user_id[0].user_id,
                token,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                token_expiration: moment()
                    .add(1, 'day')
                    .format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry(
                `UPDATE sign_up_requests
                SET valid = 0
                WHERE user_id = ?`,
                [user.user_id]
            )

            await db.qry(
                `INSERT INTO sign_up_requests
                SET ?`,
                [request]
            )

            await mail.newRegisterEmailConfirmation(user, token)
        } else {
            await mail.newRegisterEmailWarning(email_in_use[0])
        }

        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )
        const user = users[0]

        return res.json({
            status: true,
            user,
            message: `A confirmation email has been sent to ${req.body.email}`,
        })
    } catch (error) {
        throw error
    }
})

app.post('/verifyNewAccount', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry(
            `SELECT *
            FROM sign_up_requests
            WHERE token = ?
            AND token_expiration > DATE(NOW())
            AND valid = 1
            AND completed = 0`,
            [req.body.new_account_token]
        )
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        await db.qry(
            `UPDATE users
            SET verified = 1
            WHERE user_id = ?`,
            [request.user_id]
        )

        await db.qry(
            `UPDATE sign_up_requests
            SET valid = 0,
            completed = 1,
            completed_date = ?
            WHERE token = ?`,
            [moment().format('YYYY-MM-DD HH:mm:ss'), req.body.new_account_token]
        )

        return res.json({
            status: true,
        })
    } catch (error) {
        throw error
    }
})

app.post('/login', multipartMiddleware, async (req, res) => {
    try {
        req.body.email = req.body.email.toLowerCase()
        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )
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
        const deleted = user.deleted

        if (authenticated && verified && !deleted) {
            await db.qry(
                `UPDATE users
                SET last_login_date = ?
                WHERE user_id = ?`,
                [moment().format('YYYY-MM-DD HH:mm:ss'), user.user_id]
            )

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
        req.body.email = req.body.email.toLowerCase()
        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )
        if (users.length) {
            const user = users[0]
            delete user.password
            const verified = user.verified
            const deleted = user.deleted
            if (verified && !deleted) {
                const token_val = await crypto.randomBytes(20)
                const token = token_val.toString('hex')
                const request = {
                    user_id: user.user_id,
                    token,
                    request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                    token_expiration: moment()
                        .add(1, 'hour')
                        .format('YYYY-MM-DD HH:mm:ss'),
                }
                await db.qry(
                    `UPDATE password_reset_requests
                    SET valid = 0
                    WHERE user_id = ?`,
                    [user.user_id]
                )
                await db.qry(
                    `INSERT INTO password_reset_requests
                    SET ?`,
                    [request]
                )
                await mail.newPasswordResetRequest(user, token)
            }
        }
        return res.json({
            status: true,
            message: `Password recovery email sent to ${req.body.email}`,
        })
    } catch (error) {
        throw error
    }
})

app.post('/verifyPasswordResetToken', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry(
            `SELECT *
            FROM password_reset_requests
            WHERE token = ?
            AND token_expiration > DATE(NOW())
            AND valid = 1
            AND completed = 0`,
            [req.body.reset_token]
        )
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
        const requests = await db.qry(
            `SELECT *
            FROM password_reset_requests
            WHERE token = ?
            AND token_expiration > DATE(NOW())
            AND valid = 1
            AND completed = 0`,
            [req.body.reset_token]
        )
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE user_id = ?`,
            [request.user_id]
        )
        if (!users.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }
        const hash = await bcrypt.hash(req.body.new_password, saltRounds)

        await db.qry(
            `UPDATE users
            SET password = ?
            WHERE user_id = ?`,
            [hash, users[0].user_id]
        )

        await db.qry(
            `UPDATE password_reset_requests
            SET valid = 0,
            completed = 1,
            completed_date = ?
            WHERE token = ?`,
            [moment().format('YYYY-MM-DD HH:mm:ss'), req.body.reset_token]
        )

        return res.json({
            status: true,
        })
    } catch (error) {
        throw error
    }
})

app.post('/changeEmail', multipartMiddleware, async (req, res) => {
    try {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(String(req.body.new_email).toLowerCase())) {
            return res.json({
                status: false,
                message: 'Invalid email address',
            })
        }

        req.body.email = req.body.email.toLowerCase()
        req.body.new_email = req.body.new_email.toLowerCase()

        const usersA = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )

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

        await db.qry(
            `UPDATE email_change_requests
            SET valid = 0
            WHERE user_id = ?`,
            [user.user_id]
        )

        const existing_email = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.new_email]
        )
        if (existing_email.length) {
            await mail.newChangeEmailWarning(existing_email[0])
        } else {
            const token_val = await crypto.randomBytes(20)
            const token = token_val.toString('hex')

            const request = {
                user_id: user.user_id,
                requested_email: req.body.new_email,
                token,
                request_date: moment().format('YYYY-MM-DD HH:mm:ss'),
                token_expiration: moment()
                    .add(1, 'day')
                    .format('YYYY-MM-DD HH:mm:ss'),
            }

            await db.qry(
                `INSERT INTO email_change_requests
                SET ?`,
                [request]
            )

            user.email = req.body.new_email

            await mail.newChangeEmailConfirmation(user, token)
        }

        return res.json({
            status: true,
            message: `A confirmation email has been sent to ${req.body.new_email}`,
        })
    } catch (error) {
        throw error
    }
})

app.post('/verifyNewEmail', multipartMiddleware, async (req, res) => {
    try {
        const requests = await db.qry(
            `SELECT *
            FROM email_change_requests
            WHERE token = ?
            AND token_expiration > DATE(NOW())
            AND valid = 1
            AND completed = 0`,
            [req.body.new_email_token]
        )
        if (!requests.length) {
            return res.json({
                status: false,
                message: 'Something went wrong',
            })
        }

        const request = requests[0]

        await db.qry(
            `UPDATE users
            SET email = ?
            WHERE user_id = ?`,
            [request.requested_email, request.user_id]
        )

        await db.qry(
            `UPDATE email_change_requests
            SET valid = 0,
            completed = 1,
            completed_date = ?
            WHERE token = ?`,
            [moment().format('YYYY-MM-DD HH:mm:ss'), req.body.new_email_token]
        )

        await db.qry(
            `UPDATE email_change_requests
            SET valid = 0
            WHERE requested_email = ?`,
            [request.requested_email]
        )

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
        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )
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
        const deleted = user.deleted

        if (authenticated && verified && !deleted) {
            const hash = await bcrypt.hash(req.body.new_password, saltRounds)

            await db.qry(
                `UPDATE users
                SET password = ?
                WHERE user_id = ?`,
                [hash, user.user_id]
            )

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
        req.body.email = req.body.email.toLowerCase()

        const users = await db.qry(
            `SELECT *
            FROM users
            WHERE email = ?`,
            [req.body.email]
        )
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
        const deleted = user.deleted

        if (authenticated && verified && !deleted) {
            await db.qry(
                `UPDATE users
                SET deleted = 1,
                deleted_date = ?
                WHERE user_id = ?`,
                [moment().format('YYYY-MM-DD HH:mm:ss'), user.user_id]
            )

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

app.post('/joinQueue', multipartMiddleware, async (req, res) => {
    try {
        // REMOVE PREVIOUS QUEUE INSTANCES
        await db.qry(
            `UPDATE queued_users
            SET valid = 0,
            removed = 1
            WHERE user_id = ?
            AND matched = 0`,
            [req.body.user_id]
        )
        // REMOVE PREVIOUS GAMES
        await db.qry(
            `UPDATE games
            SET valid = 0, removed = 1
            WHERE valid = 1
            AND completed = 0
            AND quitted = 0
            AND
            (
            p1_user_id = ?
            OR p2_user_id = ?
            )`,
            [req.body.user_id, req.body.user_id]
        )

        const game_modes = ['SYN', 'ANT', 'HYP']

        if (game_modes.indexOf(req.body.game_mode) === -1) {
            return res.json({
                status: false,
                message: `${req.body.game_mode} is not a valid game mode`,
            })
        }

        const request = {
            user_id: req.body.user_id,
            game_mode: req.body.game_mode,
            initialisation_date: moment().format('YYYY-MM-DD HH:mm:ss'),
            last_heartbeat: moment().format('YYYY-MM-DD HH:mm:ss'),
        }

        await db.qry(
            `INSERT INTO queued_users
            SET ?`,
            [request]
        )

        return res.json({
            status: true,
            message: 'success',
        })
    } catch (error) {
        throw error
    }
})

app.post('/heartbeat', multipartMiddleware, async (req, res) => {
    try {
        await db.qry(
            `UPDATE queued_users
            SET last_heartbeat = ?
            WHERE user_id = ?
            AND valid = 1
            AND removed = 0
            AND matched = 0`,
            [moment().format('YYYY-MM-DD HH:mm:ss'), req.body.user_id]
        )

        const users = await db.qry(
            `SELECT *
            FROM queued_users
            WHERE user_id = ?
            ORDER BY initialisation_date DESC LIMIT 1`, // cannot use the valid property as it will now be 0
            [req.body.user_id]
        )
        const user = users[0]

        if (user.matched) {
            return res.json({
                status: true,
                user,
            })
        }

        return res.json({
            status: false,
        })
    } catch (error) {
        throw error
    }
})

app.post('/getGameInfo', multipartMiddleware, async (req, res) => {
    try {
        const games = await db.qry(
            `SELECT id, p1_user_id, p2_user_id, game_mode, initialisation_date, termination_date, token, words
            FROM games
            WHERE valid = 1
            AND completed = 0
            AND quitted = 0
            AND removed = 0
            AND token = ?
            AND (p1_user_id = ?
                OR p2_user_id = ?)`,
            [req.body.token, req.body.user_id, req.body.user_id]
        )
        const game = games[0]

        if (game) {
            game.words = JSON.parse(game.words)
            return res.json({
                status: true,
                game,
                player_no: game.p1_user_id === req.body.user_id ? 1 : 2,
            })
        }

        return res.json({
            status: false,
        })
    } catch (error) {
        throw error
    }
})

app.post('/finishGame', multipartMiddleware, async (req, res) => {
    try {
        await db.qry(
            `UPDATE games
            SET completed = 1,
            valid = 0
            WHERE id = ?
            AND quitted = 0
            AND removed = 0`,
            [req.body.game_id]
        )
        await db.qry(
            `UPDATE words
            SET uncompleted = 1
            WHERE game_id = ?
            AND matched = 0
            AND passed = 0`,
            [req.body.game_id]
        )

        return res.json({
            status: true,
        })
    } catch (error) {
        throw error
    }
})

app.post('/getGameResults', multipartMiddleware, async (req, res) => {
    try {
        const games = await db.qry(
            `SELECT id, p1_user_id, p2_user_id
            FROM games
            WHERE token = ?`,
            [req.body.token]
        )
        const game = games[0]

        // DETERMINE PLAYER NUMBER
        const player_no = game.p1_user_id === req.body.user_id ? 1 : 2
        // THE SUBMITTING PLAYER'S PLAYER NUMBER
        const this_player_no_answers = player_no === 1 ? 'p1_answers' : 'p2_answers'
        // THE OTHER PLAYER'S PLAYER NUMBER
        const other_player_no_answers = player_no === 1 ? 'p2_answers' : 'p1_answers'

        // GET ALL WORDS FOR THAT GAME
        const words = await db.qry(
            `SELECT word, ${this_player_no_answers} AS this_player, ${other_player_no_answers} AS other_player, matched, matched_word, passed, uncompleted
            FROM words
            WHERE game_id = ?`,
            [game.id]
        )

        if (words.length) {
            let matched_count = 0
            let passed_count = 0
            let uncompleted_count = 0
            words.forEach(word => {
                if (word.matched) {
                    matched_count++
                } else if (word.passed) {
                    passed_count++
                } else if (word.uncompleted) {
                    uncompleted_count++
                }
                let this_player_words = ''
                let other_player_words = ''
                JSON.parse(word.this_player).forEach(answer => {
                    this_player_words += `${answer}, `
                })
                JSON.parse(word.other_player).forEach(answer => {
                    other_player_words += `${answer}, `
                })
                word.this_player = this_player_words.slice(0, -2)
                word.other_player = other_player_words.slice(0, -2)
            })
            return res.json({
                status: true,
                words,
                matched_count,
                passed_count,
                uncompleted_count,
            })
        }

        return res.json({
            status: false,
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
    res.send('<h1>Welcome to Werdz</h1>')
})

const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`)
})

const io = require('socket.io')(server)

io.on('connection', socket => {
    const token = socket.request._query['token']
    if (token) {
        socket.join(token)
    } else {
        socket.join('queue')
    }

    socket.on('inQueue', async req => {
        try {
            const queued_users = await db.qry(
                `SELECT game_mode
                FROM queued_users
                WHERE valid = 1`
            )
            io.in('queue').emit('queueStatus', {
                // EMIT TO ALL OTHER PLAYERS IN THE 'queue' ROOM
                status: true,
                queued_users,
            })
        } catch (error) {
            throw error
        }
    })

    socket.on('submitAnswer', async req => {
        try {
            // THE SUBMITTING PLAYER'S PLAYER NUMBER
            const this_player_no_answers = req.player_no === 1 ? 'p1_answers' : 'p2_answers'
            // THE OTHER PLAYER'S PLAYER NUMBER
            const other_player_no_answers = req.player_no === 1 ? 'p2_answers' : 'p1_answers'

            // GET THE CURRENT ANSWERS PREVIOUSLY ENTERED BY BOTH PLAYERS
            const answers_as_string = await db.qry(
                `SELECT ${this_player_no_answers} AS this_player, ${other_player_no_answers} AS other_player
                FROM words
                WHERE game_id = ?
                AND word = ?`,
                [req.game_id, req.current_word]
            )

            if (!answers_as_string.length) {
                return
            }

            const answers = answers_as_string[0]

            // CONVERT STRINGS TO ACTUAL
            const this_players_words = JSON.parse(answers.this_player)
            const other_players_words = JSON.parse(answers.other_player)

            const match = {
                status: false,
                answer: null,
            }

            // FOR EACH NEW ANSWER, ADD IT TO THIS PLAYER'S ANSWERS
            req.answers.forEach(answer => {
                this_players_words.push(answer.answer)
            })

            // FIND ANSWERS THAT ARE IN BOTH PLAYER'S ARRAYS OF ANSWERS
            const matches = _.intersection(this_players_words, other_players_words)
            if (matches.length) {
                match.status = true
                match.answer = matches[0]
            }

            // PREPARE ANSWERS TO BE RE-ADDED TO THE DATABASE
            let this_players_words_as_string = ''
            this_players_words.forEach(word => {
                this_players_words_as_string += `"${word}", `
            })
            this_players_words_as_string = `[${this_players_words_as_string.slice(0, -2)}]`

            if (match.status) {
                // IF THERE WAS A MATCH
                await db.qry(
                    `UPDATE words
                    SET matched = 1,
                    passed = 0,
                    matched_word = ?,
                    ${this_player_no_answers} = ?
                    WHERE game_id = ?
                    AND word = ?`,
                    [match.answer, this_players_words_as_string, req.game_id, req.current_word]
                )

                if (req.max_word_index === req.current_word_index) {
                    await db.qry(
                        `UPDATE games
                        SET completed = 1,
                        valid = 0
                        WHERE id = ?
                        AND quitted = 0
                        AND removed = 0`,
                        [req.game_id]
                    )
                    await db.qry(
                        `UPDATE words
                        SET uncompleted = 1
                        WHERE game_id = ?
                        AND matched = 0
                        AND passed = 0`,
                        [req.game_id]
                    )
                }

                io.in(req.game_token).emit('answerSubmitted', {
                    // EMIT TO BOTH PLAYERS
                    status: true,
                    word: match.answer,
                })

                return
            } else {
                // IF THERE WAS NOT A MATCH
                await db.qry(
                    `UPDATE words
                    SET ${this_player_no_answers} = ?
                    WHERE game_id = ?
                    AND word = ?`,
                    [this_players_words_as_string, req.game_id, req.current_word]
                )

                io.in(req.game_token).emit('answerSubmitted', {
                    status: false,
                    this_player_id: req.user_id,
                    this_player_word_count: this_players_words.length,
                    other_player_word_count: other_players_words.length,
                })

                return
            }
        } catch (error) {
            throw error
        }
    })

    socket.on('skipWord', async req => {
        try {
            await db.qry(
                `UPDATE words
                SET passed = 1,
                matched = 0
                WHERE game_id = ?
                AND word = ?`,
                [req.game_id, req.current_word]
            )
            socket.to(req.game_token).emit('otherPlayerSkipped', {
                // EMIT ONLY TO OTHER PLAYER
                user_id: req.user_id,
                status: true,
            })
        } catch (error) {
            throw error
        }
    })

    socket.on('confirmSkip', async req => {
        try {
            socket.to(req.game_token).emit('otherPlayerConfirmedSkipped', {
                // EMIT ONLY TO OTHER PLAYER
                user_id: req.user_id,
                status: true,
            })
        } catch (error) {
            throw error
        }
    })

    socket.on('quitGame', async req => {
        try {
            await db.qry(
                `UPDATE games
                SET valid = 0,
                quitted = 1
                WHERE id = ?
                AND completed = 0
                AND removed = 0`,
                [req.game_id]
            )
            await db.qry(
                `UPDATE words
                SET uncompleted = 1
                WHERE game_id = ?
                AND matched = 0
                AND passed = 0`,
                [req.game_id]
            )
            socket.to(req.game_token).emit('otherPlayerQuit', {
                // EMIT ONLY TO OTHER PLAYER
                user_id: req.user_id,
                status: true,
            })
        } catch (error) {
            throw error
        }
    })
})
