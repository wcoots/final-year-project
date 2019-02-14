const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = require('./../config')
const nodemailer = require('nodemailer')
const smtpTransport = require('nodemailer-smtp-transport')


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

function newChangeEmailConfirmation(user) {
    return new Promise(async (resolve, reject) => {
        const req = {
            address: user.email,
            subject: 'Confirm new email address',
            html: `
                <p>Hi ${user.forename},</p>
                <p>Click here to verify that this is your new email.</p>
                <p>Thanks,</p>
                <p>William Cooter</p>
            `
        }
        await newMail(req)
        resolve()
    })
}

function newChangeEmailWarning(user) {
    return new Promise(async (resolve, reject) => {
        const req = {
            address: user.email,
            subject: 'Did you try to change your email?',
            html: `
                <p>Hi ${user.forename},</p>
                <p>Someone just attempted to use your email for an account.</p>
                <p>If this was you, you already have an account, and can log in at...</p>
                <p>Thanks,</p>
                <p>William Cooter</p>
            `
        }
        await newMail(req)
        resolve()
    })
}

function newRegisterEmailConfirmation(user) {
    return new Promise(async (resolve, reject) => {
        const req = {
            address: user.email,
            subject: 'Confirm email address',
            html: `
                <p>Hi ${user.forename},</p>
                <p>Click here to verify that this is your email.</p>
                <p>Thanks,</p>
                <p>William Cooter</p>
            `
        }
        await newMail(req)
        resolve()
    })
}

function newRegisterEmailWarning(user) {
    return new Promise(async (resolve, reject) => {
        const req = {
            address: user.email,
            subject: 'Did you try to register?',
            html: `
                <p>Hi ${user.forename},</p>
                <p>Someone just attempted to use your email for an account.</p>
                <p>If this was you, you already have an account, and can log in at...</p>
                <p>Thanks,</p>
                <p>William Cooter</p>
            `
        }
        await newMail(req)
        resolve()
    })
}

function newPasswordResetRequest(user) {
    return new Promise(async (resolve, reject) => {
        const req = {
            address: user.email,
            subject: 'Reset your password',
            html: `
                <p>Hi ${user.forename},</p>
                <p>Click here to change your password.</p>
                <p>Thanks,</p>
                <p>William Cooter</p>
            `
        }
        await newMail(req)
        resolve()
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
