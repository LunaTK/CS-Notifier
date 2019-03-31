require('dotenv').config()
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PW
    }
}));


export default function sendMail(content) {
    var mailOptions = {
        from: `공지알리미 💡<${process.env.GMAIL_ID}>`,
        to: 'ahn_v3@naver.com',
        subject: 'Sending Email using Node.js',
        html: content
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}