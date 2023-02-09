const express = require('express')
const router = express.Router()
const db = require('../model')
const nodemailer = require('nodemailer')
const config = require('../config.json')

const data = {
  skills: db.get('skills').value(),
  products: db.get('products').value(),
}

router.get('/', (req, res, next) => {
  res.render('pages/index', {
    title: 'Main page',
    ...data,
  })
})

router.post('/', (req, res, next) => {
  if (!req.body.name || !req.body.email || !req.body.text) {
    return res.json({
      msg: 'All fields must be filled',
      status: 'Error',
    })
  }
  // initialize the module for sending emails and specify the data from the config
  // const transporter = nodemailer.createTransport(config.mail.smtp)
  const transporter = nodemailer.createTransport({
    host: config.mail_test.smtp.host,
    port: config.mail_test.smtp.port,
  })

  const mailOptions = {
    from: `"${req.body.name}" <${req.body.email}>`,
    to: config.mail_test.smtp.auth.user,
    subject: config.mail_test.subject,
    text:
      req.body.text.trim().slice(0, 500) + `\n Sent from: <${req.body.email}>`,
  }

  // send mail
  transporter.sendMail(mailOptions, function (error, info) {
    // if there are errors while sending, we report it
    if (error) {
      return res.json({
        msg: `An error occurred while sending the email: ${error}`,
        status: 'Error',
      })
    }
    res.json({ msg: 'Email sent successfully', status: 'Ok' })
  })
})

module.exports = router
