const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a transporter using Gmail and OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
    accessToken: process.env.ACCESS_TOKEN
  }
});

app.post('/generate-certificate', (req, res) => {
  const { name, email, course, date } = req.body;

  // Here you would generate the PDF certificate
  // For this example, we'll just send a plain text email

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: `Certificate for ${course}`,
    text: `Dear ${name},\n\nCongratulations on completing the ${course} course on ${date}.\n\nYour certificate is attached to this email.\n\nBest regards,\nYour Course Team`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).send('Error sending email');
    } else {
      console.log('Email sent: ' + info.response);
      res.status(200).send('Certificate generated and email sent');
    }
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
