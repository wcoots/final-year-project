const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = require('./config')
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

    })
}

module.exports = {
    newMail,
}
