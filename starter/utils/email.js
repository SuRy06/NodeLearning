const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // const host = process.env.EMAIL_HOST;
  // const port = process.env.EMAIL_PASSWORD;
  // const auth = {
  //   user: process.env.EMAIL_USERNAME,
  //   pass: process.env.EMAIL_PASSWORD,
  // };

  // 1) CREATE A TRANSPORTER
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PASSWORD,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2) DEFINE THE EMAIL OPTIONS
  const mailOptions = {
    from: 'Sudeep Chowhdury <codeingsury06@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3) ACTUALLY SEND THE EMAIL
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
