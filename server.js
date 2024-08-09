const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com', // Replace with your SMTP host
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'your_email@example.com', // Replace with your email
    pass: 'your_password' // Replace with your password
  }
});

app.post('/generate-certificate', (req, res) => {
  const { name, email, course, date } = req.body;

  // Here you would generate the PDF certificate
  // For this example, we'll just send a plain text email

  const mailOptions = {
    from: 'your_email@example.com',
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
