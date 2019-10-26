const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

const transporter = nodemailer.createTransport(
  smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
      user: process.env.GMAIL_ID,
      pass: process.env.GMAIL_PW
    }
  })
);

exports.sendMail = (to, subject, content) => {
  const mailOptions = {
    from: `공지알리미 💡<${process.env.GMAIL_ID}>`,
    to: to.join(', '),
    subject: subject,
    html: content
  };
  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};
