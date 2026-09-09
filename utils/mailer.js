const nodeMailer = require('nodemailer');

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

function verificationCode( toEmail, code ) {
    const options = {
        from: process.env.EMAIL_USER,
        to: toEmail,
        subject: 'This is your verification code',
        text: `Your verification code is: ${code}`
    };
    transporter.sendMail(options);
}

module.exports = {verificationCode};