const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb } = require("pdf-lib");
const fs = require("fs").promises;
const path = require("path");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static("public"));

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "shashankphatkurepro@gmail.com",
    pass: "bkqa fpqn wvab ojdi",
  },
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/generate-certificate", async (req, res) => {
  try {
    const { name, email, date } = req.body;

    // Load the PDF template
    const templatePath = path.join(__dirname, "certificate_template.pdf");
    const templatePdfBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templatePdfBytes);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Add text to the PDF
    firstPage.drawText(name, {
      x: 300,
      y: 300,
      size: 30,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(date, {
      x: 300,
      y: 250,
      size: 20,
      color: rgb(0, 0, 0),
    });

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    const outputPath = path.join(__dirname, "generated_certificate.pdf");
    await fs.writeFile(outputPath, pdfBytes);

    // Send email with attachment
    const mailOptions = {
      from: "shashankphatkurepro@gmail.com",
      to: email,
      subject: "Your Generated Certificate",
      text: "Please find your generated certificate attached.",
      attachments: [
        {
          filename: "certificate.pdf",
          path: outputPath,
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    res.send("Certificate generated and sent successfully!");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating the certificate.");
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
