// const { worker } = require("cluster");
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const { createWorker } = require("tesseract.js");
// const path = require("image-path");

// const worker = createWorker({
//   langPath: path.join(__dirname, "..", "uploads"),
//   logger: (m) => console.log(m),
// });

// (async () => {
//   await worker.load();
//   await worker.loadLanguage("eng");
//   await worker.initialize("eng");
//   const {
//     data: { text },
//   } = await worker.recognize("image-path");
//   console.log(text);
//   await worker.terminate();
// })();
// const { createWorker } = require("tesseract.js");
const worker = createWorker();
const PSM = require("tesseract.js/src/constants/PSM.js");

// const worker = new TesseractWorker();
// const {createWorker = new TesseractWorker();
// const createWorker = new createWorker();

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
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      worker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          res.redirect("/download");
        })
        .finally(() => worker.terminate());
    });
  });
});

async function getTextFromImage() {
  await worker.load();
  await worker.loadLanguage("eng");
  await worker.initialize("eng");
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.AUTO,
  });
  const {
    data: { text },
  } = await worker.recognize("./uploads/Afghanistan Bank Notes_003.jpg");
  await worker.terminate();

  return text;
}
getTextFromImage().then(console.log);

// app.get("/download", (req, res) => {
//   const file = `${__dirname}/tesseract.js-ocr-result.pdf`;
//   res.download(file);
// });

// Start up our server

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log(`Hey I am running on port ${PORT}`));
