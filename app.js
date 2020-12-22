// const { worker } = require("cluster");
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");

const worker = createWorker({
  logger: (m) => console.log(m),
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).single("avatar");

app.set("view engine", "ejs");

// Routes

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", (req, res) => {
  upload(req, res, (err) => {
    console.log(req);
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      (async () => {
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");

        const {
          data: { text },
        } = await worker.recognize(data);
        console.log(text);

        // const { data: pdfData } = await worker.getPDF("Tesseract OCR Result");
        // fs.writeFileSync("${req.file.originalname}.pdf", Buffer.from(pdfData));
        // console.log("Generate PDF: ${req.file.originalname}.pdf");

        res.send(text);
        await worker.terminate();
      })();
    });
  });
});

//   return text;
// }
// getTextFromImage().then(console.log);

// app.get("/download", (req, res) => {
//   const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
//   res.download(file);
// });

// Start up our server

const PORT = 4000;
app.listen(PORT, () => console.log("Hey I am running on port 4000!", PORT));
