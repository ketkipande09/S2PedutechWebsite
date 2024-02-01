const {OPTIONS, generateHtml, genAbsoluteUrl} = require("../../config/options/global.options");
const notification = require("../service/notification.service");

exports.sendOTPEmail = async receiver => {
    let html = generateHtml("email", {
        name: `${receiver.firstName} ${receiver.lastName}`,
        mailMessage: {
            line1: `Hi ${user.name}, You're one step away`,
            line2: `Your verification OTP is ${token}`,
        },
    });
    notification.triggerMail(receiver.email, OPTIONS.emailSubjects.ACCOUNT_VERIFY, "", html);
};

exports.sendWelcomeEmail = async receiver => {
    let html = generateHtml("email", {
        name: `${receiver.firstName} ${receiver.lastName}`,
        buttonText: "Sign In",
        mailMessage: {
            line1: `Welcome ${receiver.name}, thanks for signing up`,
            line2: "Your registration is now complete.",
            line3: "You're one step closer to purchasing the finest food items that we offer.",
        },
    });
    notification.triggerMail(receiver.email, OPTIONS.emailSubjects.ACCOUNT_WELCOME, "", html);
};

exports.sendNewPasswordEmail = async receiver => {
    let html = generateHtml("email", {
        name: `${receiver.name}`,
        buttonText: `${receiver.NewPassword}`,
        mailMessage: {
            line1: `Congrats ${receiver.name}`,
            line2: "Your password for login is.",
        },
    });
    notification.triggerMail(receiver.email, OPTIONS.emailSubjects.ACCOUNT_VERIFY, "", html);
};

exports.sendResetPassword = async (receiver, password, line2 = "") => {
    let html = generateHtml("email", {
        name: `${receiver.name}`,
        redirectionLink: genAbsoluteUrl(`/home?tab=login`, "site"),
        buttonText: "Sign In",
        mailMessage: {
            line1: `Congrats ${receiver.name}`,
            line2: line2 || "Your Password has been changed.",
        },
    });
};
