const fs = require('fs');
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
const path = require('path');
const _ = require('lodash');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_SEND_ID,
    pass: process.env.EMAIL_SEND_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// to read the template
var readHTMLFile = function (path, callback) {
  fs.readFile(
    path,
    {
      encoding: 'utf-8',
    },
    function (err, html) {
      if (err) {
        throw err;
        callback(err);
      } else {
        callback(null, html);
      }
    }
  );
};
exports.sendMail = async function (subject, body, emailArr) {
  console.log('SubjectBodyTo', subject, body, emailArr);
  var unique = [];
  var To = [];
  emailArr.forEach((x) => {
    if (!unique[x]) {
      To.push(x);
      unique[x] = 1;
    }
  });
  console.log('To', To);
  let mailOptions = {
    from: `S2p edutech ${process.env.EMAIL_SEND_ID}`,
    to: null,
    subject: null,
    text: null,
    html: null,
    attachments: null,
  };
  mailOptions.from = `S2p edutech ${process.env.EMAIL_SEND_ID}`;
  mailOptions.to = To.toString();
  mailOptions.subject = subject;
  mailOptions.text = body;
  await send(mailOptions);
};

exports.attachedMail = async function (subject, body, To, filePath) {
  console.log('process.env.EMAIL_SEND_ID', process.env.EMAIL_SEND_ID);
  console.log(
    'process.env.EMAIL_SEND_PASSWORD',
    process.env.EMAIL_SEND_PASSWORD
  );
  console.log(subject, body, To, filePath);
  let mailOptions = {
    from: `Emerge ${process.env.EMAIL_SEND_ID}`,
    to: null,
    subject: null,
    text: null,
    html: null,
    attachments: null,
  };
  mailOptions.from = `Emerge ${process.env.EMAIL_SEND_ID}`;
  mailOptions.to = To.toString();
  mailOptions.subject = subject;
  mailOptions.text = body;
  mailOptions.attachments = [
    {
      // filename: `${fileName}.pdf`,
      path: filePath,
    },
  ];
  await send(mailOptions);
  console.log('mailOptions....attachedMail', mailOptions);
  console.log('filePath..................', filePath);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
exports.sendForgetMail = function (req, data) {
  let mailOptions = {
    from: `S2p edutech ${process.env.EMAIL_SEND_ID}`,
    to: null,
    subject: null,
    text: null,
    html: null,
    attachments: null,
  };
  readHTMLFile('templates/assign/forget-pwd.html', async function (err, html) {
    var template = handlebars.compile(html);
    var replacements = data;
    mailOptions.html = template(replacements);
    mailOptions.subject = 'Forget Password';
    mailOptions.to = data.email;
    await send(mailOptions);
    //console.log("mailOptions....sendForgetMail",mailOptions);
  });
};
exports.sendForgetMails = function (req, data) {
  let mailOptions = {
    from: `Emerge ${process.env.EMAIL_SEND_ID}`,
    to: null,
    subject: null,
    text: null,
    html: null,
    attachments: null,
  };
  readHTMLFile(
    'templates/assign/company-forgotPwd.html',
    async function (err, html) {
      var template = handlebars.compile(html);
      var replacements = data;
      mailOptions.html = template(replacements);
      mailOptions.subject = ' Company Forget Password';
      mailOptions.to = data.emailId;
      console.log('mailOptions.to', mailOptions.to);
      await send(mailOptions);
      // console.log("mailOptions....sendForgetMail",mailOptions);
    }
  );
};
exports.sendJobMail = function (To, data) {
  let mailOptions = {
    from: `Emerge ${process.env.EMAIL_SEND_ID}`,
    to: null,
    subject: null,
    text: null,
    html: null,
    attachments: null,
  };
  readHTMLFile('templates/assign/jobMail.html', async function (err, html) {
    var template = handlebars.compile(html);
    var replacements = data;
    mailOptions.html = template(replacements);
    mailOptions.subject = 'Vacancies';
    mailOptions.to = To.toString();
    await send(mailOptions);
    //console.log("mailOptions....sendForgetMail",mailOptions);
  });
};

async function send(mailOptions) {
  let { error, info } = await transporter.sendMail(mailOptions);
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent:- ', info);
  }
}
