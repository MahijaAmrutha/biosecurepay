const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'amruthadevarapalli1306@gmail.com',
    pass: 'tvwp uftm prow ghbz',  // ← this is not your normal Gmail password
  },
});

module.exports = transporter;
