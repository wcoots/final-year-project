const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS, NODE_ENV } = require('./../config')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const fs = require('fs')

const determineNodeEnv = () => {
    if (NODE_ENV === 'development') {
        return 'http://localhost:3000'
    } else if (NODE_ENV === 'production') {
        return 'https://werdz.fun'
    }
}

const newMail = async req => {
    return new Promise(async (resolve, reject) => {
        const transporter = await nodemailer.createTransport(
            smtpTransport({
                service: EMAIL_SERVICE,
                host: `smtp.${EMAIL_SERVICE}.com`,
                port: 465,
                secure: true,
                auth: {
                    user: EMAIL_USER,
                    pass: EMAIL_PASS,
                },
            })
        )

        const mailOptions = {
            from: `"Werdz" <${EMAIL_USER}>`,
            to: req.address,
            subject: req.subject,
            html: req.html,
        }

        await transporter.sendMail(mailOptions)

        resolve()
    })
}

const newChangeEmailConfirmation = async (user, token) => {
    return new Promise(async (resolve, reject) => {
        const url = determineNodeEnv()
        await fs.readFile(
            __dirname + '/api/templates/change-email-confirmation.html',
            'utf8',
            async (err, data) => {
                if (err) {
                    throw err
                }
                const req = {
                    address: user.email,
                    subject: 'Confirm new email address',
                    html: eval('`' + data.toString() + '`'),
                }
                await newMail(req)
                resolve()
            }
        )
    })
}

const newChangeEmailWarning = async user => {
    return new Promise(async (resolve, reject) => {
        const url = determineNodeEnv()
        await fs.readFile(
            __dirname + '/api/templates/change-email-warning.html',
            'utf8',
            async (err, data) => {
                if (err) {
                    throw err
                }
                const req = {
                    address: user.email,
                    subject: 'Did you try to change your email?',
                    html: eval('`' + data.toString() + '`'),
                }
                await newMail(req)
                resolve()
            }
        )
    })
}

const newRegisterEmailConfirmation = async (user, token) => {
    return new Promise(async (resolve, reject) => {
        const url = determineNodeEnv()
        await fs.readFile(
            __dirname + '/api/templates/register-email-confirmation.html',
            'utf8',
            async (err, data) => {
                if (err) {
                    throw err
                }
                const req = {
                    address: user.email,
                    subject: 'Confirm email address',
                    html: eval('`' + data.toString() + '`'),
                }
                await newMail(req)
                resolve()
            }
        )
    })
}

const newRegisterEmailWarning = async user => {
    return new Promise(async (resolve, reject) => {
        const url = determineNodeEnv()
        await fs.readFile(
            __dirname + '/api/templates/register-email-warning.html',
            'utf8',
            async (err, data) => {
                if (err) {
                    throw err
                }
                const req = {
                    address: user.email,
                    subject: 'Did you try to register?',
                    html: eval('`' + data.toString() + '`'),
                }
                await newMail(req)
                resolve()
            }
        )
    })
}

const newPasswordResetRequest = async (user, token) => {
    return new Promise(async (resolve, reject) => {
        const url = determineNodeEnv()
        await fs.readFile(
            __dirname + '/api/templates/password-reset-request.html',
            'utf8',
            async (err, data) => {
                if (err) {
                    throw err
                }
                const req = {
                    address: user.email,
                    subject: 'Reset your password?',
                    html: eval('`' + data.toString() + '`'),
                }
                await newMail(req)
                resolve()
            }
        )
    })
}

module.exports = {
    newMail,
    newChangeEmailConfirmation,
    newChangeEmailWarning,
    newRegisterEmailConfirmation,
    newRegisterEmailWarning,
    newPasswordResetRequest,
}
