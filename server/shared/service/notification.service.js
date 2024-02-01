const OPTIONS = require("../../config/options/global.options");
const nodeMailer = require("nodemailer");

// const fcmAdmin = require("");

exports.triggerMail = (to, subject, text, html) => {
    return true;
    html = html || "";
    if (!to) return;

    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_SMTP_HOST,
            secure: false,
            auth: {
                user: process.env.MAIL_SMTP_USERNAME,
                pass: process.env.MAIL_SMTP_PASSWORD,
            },
            tls: {
                ciphers: "SSLv3",
            },
        });

        const mailOptions = {
            from: `"${OPTIONS.emailSenderName}"<${process.env.MAIL_SMTP_FROM}>`,
            to: to,
            subject: subject,
            text: text,
            html: html,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                reject(error);
            }
            resolve(info);
        });
    });
};

exports.triggerSMS = () => {
    return true;
};

// exports.triggerFCM = async (deviceTokens, data) => {
//     try {
//         let payloadData = {
//             title: data.title,
//             message: data.message,
//             type: data.type || "",
//             additional: data.additional ? JSON.stringify(data.additional) : "",
//         };

//         let payload = {
//             notification: {
//                 body: data.message || "",
//                 title: data.title || "",
//                 sound: "default",
//             },
//             data: payloadData,
//         };
//         fcmAdmin
//             .messaging()
//             .sendToDevice(deviceTokens, payload)
//             .then(res => {
//                 // console.log(res);
//                 // console.log('Successfully sent message:');
//             })
//             .catch(error => {
//                 customErrorLogger(error);
//             });
//         return true;
//     } catch (e) {
//         throw e;
//     }
// };
