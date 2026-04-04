import { env } from "../../../../config/config.service.js";

import nodemailer from "nodemailer";

// Create a transporter using Ethereal test credentials.
// For production, replace with your actual SMTP server details.
export const sendEmail = async ({ to, subject = '', html = '', text = '', attachments = [] } = {}) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: env.EMAIL,
            pass: env.PASSWORD,
        },
    });

    const mailOptions = {
        from: `"SarahaApp" ${env.EMAIL}`,
        to,
        subject,
        text,
        html,
        attachments
    };

    const info = await transporter.sendMail({
        from: `"SarahaApp" ${env.EMAIL}`,
        to,
        subject,
        text,
        html,
        attachments
    });

    console.log("Message sent:", info?.messageId);

    return info.accepted.length ? true : false
}

export const generateOTP = async () => {
    return Math.floor(Math.random() * 900000 + 100000).toString()
}