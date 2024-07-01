// emailSender.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ahsanallajpk22@gmail.com',
        pass: 'iyiuvrdfvfrspksj'
    }
});

exports.generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}


exports.sendEmail = (email, otp, callback) => {
    const mailOptions = {
        from: 'ahsanallajpk22@gmail.com',
        to: email,
        subject: 'Email Verification',
        html: `<p>Verify your email with this OTP ${otp} <p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            callback(error);
        } else {
            console.log("Email has been sent to user's email");
            callback(null, info);
        }
    });
}

exports.resetPassword = (email, link, callback) => {
    const mailOptions = {
        from: 'ahsanallajpk22@gmail.com',
        to: email,
        subject: 'Reset Password',
        html: `<p>Click here to reset your password <a href ="${link}">${link}</a> <p>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            callback(error);
        } else {
            console.log("Email has been sent to user's email");
            callback(null, info);
        }
    });
}