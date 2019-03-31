require('dotenv').config()
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
const pug = require('pug');
const compiledFunction = pug.compileFile('mail_template.pug');

var transporter = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: process.env.GMAIL_ID,
        pass: process.env.GMAIL_PW
    }
}));

exports.generateContent = function (type, title, news) {
    return compiledFunction({
        type,
        title,
        news
    })
}

exports.sendMail = function sendMail(subject, content) {
    const mailingList = require('./mailing_list.json');
    var mailOptions = {
        from: `공지알리미 💡<${process.env.GMAIL_ID}>`,
        to: mailingList.join(', '),
        subject: subject,
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