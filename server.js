const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
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
    const { name, email, designation, date } = req.body;

    // Load the PDF template
    const templatePath = path.join(__dirname, "certificate_template.pdf");
    const templatePdfBytes = await fs.readFile(templatePath);
    const pdfDoc = await PDFDocument.load(templatePdfBytes);

    // Register fontkit
    pdfDoc.registerFontkit(fontkit);

    // Embed the Montserrat-Bold font
    const fontPath = "./Montserrat-Bold.ttf";
    const fontBytes = await fs.readFile(fontPath);
    const montserratBoldFont = await pdfDoc.embedFont(fontBytes);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Convert #0f1176 to RGB values (normalized to 0-1 range)
    const color = {
      r: 15 / 255,
      g: 17 / 255,
      b: 118 / 255,
    };

    // Function to draw centered text
    const drawCenteredText = (text, y, fontSize) => {
      const textWidth = montserratBoldFont.widthOfTextAtSize(text, fontSize);
      const x = (width - textWidth) / 2;
      firstPage.drawText(text, {
        x,
        y,
        size: fontSize,
        font: montserratBoldFont,
        color: rgb(color.r, color.g, color.b),
      });
    };

    // firstPage.drawText(designation, {
    //   x: 240,
    //   y: 225,
    //   size: 16,
    //   font: montserratBoldFont,
    //   color: rgb(color.r, color.g, color.b),
    // });

    // Right-align the designation
    const designationWidth = montserratBoldFont.widthOfTextAtSize(
      designation,
      16
    );
    const designationX = width - designationWidth - 540; // 20 is right margin
    firstPage.drawText(designation, {
      x: designationX,
      y: 225,
      size: 16,
      font: montserratBoldFont,
      color: rgb(color.r, color.g, color.b),
    });

    firstPage.drawText(date, {
      x: 205,
      y: 115,
      size: 14,
      font: montserratBoldFont,
      color: rgb(color.r, color.g, color.b),
    });

    // Add centered text to the PDF
    drawCenteredText(name, 285, 30);

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
