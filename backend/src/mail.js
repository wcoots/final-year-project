const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = require('./../config')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')
const fs = require('fs')



function newMail(req) {
    return new Promise(async (resolve, reject) => {

        const transporter = await nodemailer.createTransport(smtpTransport({
            service: EMAIL_SERVICE,
            host: `smtp.${EMAIL_SERVICE}.com`,
            port: 465,
            secure: true,
            auth: {
                user: EMAIL_USER,
                pass: EMAIL_PASS
            }
        }))
    
        const mailOptions = {
            from: `"Cooter" <${EMAIL_USER}>`,
            to: req.address,
            subject: req.subject,
            html: req.html
        }
      
        await transporter.sendMail(mailOptions)

        resolve()
    })
}

function newChangeEmailConfirmation(user, token) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(__dirname + '/api/templates/change-email-confirmation.html', 'utf8', async (err, data) => {
            if (err) {
                throw err
            }
            const req = {
                address: user.email,
                subject: 'Confirm new email address',
                html: eval('`'+data.toString()+'`')
            }
            await newMail(req)
            resolve()
        })
    })
}

function newChangeEmailWarning(user) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(__dirname + '/api/templates/change-email-warning.html', 'utf8', async (err, data) => {
            if (err) {
                throw err
            }
            const req = {
                address: user.email,
                subject: 'Did you try to change your email?',
                html: eval('`'+data.toString()+'`')
            }
            await newMail(req)
            resolve()
        })
    })
}

function newRegisterEmailConfirmation(user, token) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(__dirname + '/api/templates/register-email-confirmation.html', 'utf8', async (err, data) => {
            if (err) {
                throw err
            }
            const req = {
                address: user.email,
                subject: 'Confirm email address',
                html: eval('`'+data.toString()+'`')
            }
            await newMail(req)
            resolve()
        })
    })
}

function newRegisterEmailWarning(user) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(__dirname + '/api/templates/register-email-warning.html', 'utf8', async (err, data) => {
            if (err) {
                throw err
            }
            const req = {
                address: user.email,
                subject: 'Did you try to register?',
                html: eval('`'+data.toString()+'`')
            }
            await newMail(req)
            resolve()
        })
    })
}

function newPasswordResetRequest(user, token) {
    return new Promise(async (resolve, reject) => {
        await fs.readFile(__dirname + '/api/templates/password-reset-request.html', 'utf8', async (err, data) => {
            if (err) {
                throw err
            }
            const req = {
                address: user.email,
                subject: 'Reset your password?',
                html: eval('`'+data.toString()+'`')
            }
            await newMail(req)
            resolve()
        })
    })
}

module.exports = {
    newMail,
    newChangeEmailConfirmation,
    newChangeEmailWarning,
    newRegisterEmailConfirmation,
    newRegisterEmailWarning,
    newPasswordResetRequest
}
