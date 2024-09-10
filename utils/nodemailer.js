const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    secure: true,
    host: "stmp.gmail.com",
    service: "gmail",
    port: 465,
    auth: {
      user: process.env.NODEMAILER_EMAIL_USER,
      pass: process.env.NODEMAILER_EMAIL_PASS 
    }
});

module.exports = transporter;