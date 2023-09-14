const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_URL, port: 1025, ignoreTLS: true,
});

module.exports = async function sendActivationEmail(to, text, email, action) {
    let emailTemplate;
    let subject;
    // shameful lazy template, contact me @/dev/null for complaints
    if (action !== 'reset') {
        subject = "Confirm your email";
        emailTemplate = `<!DOCTYPE html><html lang='en'><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Email Verification</title></head><body style=\"font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;\"><table style=\"max-width: 600px; margin: 20px auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\"><tr><td style=\"padding: 20px;\"><h1 style=\"color: #333;\">Verify Your Email Address</h1><p style=\"color: #666;\">Hello <strong>` + to + `</strong>,</p><p style=\"color: #666;\">We just need to make sure this email address belongs to you. Click the button below to verify your email:</p><a href=\"` + text + `\" style=\"display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;\">Verify Email</a><p style=\"color: #666; margin-top: 20px;\">If you did not request this verification, please ignore this email.</p></td></tr></table></body></html>\n`;
    } else {
        subject = "Reset your password";
        emailTemplate = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Password Reset</title></head><body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;"><table style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-collapse: collapse; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);"><tr><td style="padding: 20px;"><h1 style="color: #333;">Password Reset Request</h1><p style="color: #666;">Hello <strong>` + to + `</strong>,</p><p style="color: #666;">You've requested to reset your password. Click the button below to proceed:</p><a href="` + text + `" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">Reset Password</a><p style="color: #666; margin-top: 20px;">If you did not request this reset, please ignore this email.</p></td></tr></table></body></html>`;

    }
    const mailOptions = {
        from: 'linuxrocks@kernel.dev',
        to: email,
        subject: subject,
        html: emailTemplate,
    };

    await transporter.sendMail(mailOptions);
}