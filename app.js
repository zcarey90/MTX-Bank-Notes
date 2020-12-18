const { worker } = require("cluster");
const express = require("express");
const app = express();
const fs = require("fs");
const multer = require("multer");
const createWorker = require("tesseract.js");
// const { TesseractWorker } = require("tesseract.js");
// const worker = new TesseractWorker();
// Storage
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
    fs.readFile(`./uploads/${req.file.orginalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      createWorker
        .recognize(data, "eng", { tessjs_create_pdf: "1" })
        .progress((progress) => {
          console.log(progress);
        })
        .then((result) => {
          res.send(result.text);
        })
        .finally(() => createWorker.terminate());
    });
  });
});

// Start up our server

const PORT = 5000 || process.env.PORT;
app.listen(PORT, () => console.log("Hey I am running on port ${PORT}"));
