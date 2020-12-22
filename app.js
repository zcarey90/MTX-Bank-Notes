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
const worker = createWorker({
  logger: (m) => console.log(m),
});
// const PSM = require("tesseract.js/src/constants/PSM.js");

// const rectangleKeys = {
//   bankName: { left: 0, top: 0, width: 1603, height: 1001 },
//   yearIssued: { left: 0, top: 0, width: 1603, height: 1001 },
//   denomination: { left: 0, top: 0, width: 1603, height: 1001 },
//   serialNumber: { left: 0, top: 0, width: 1603, height: 1001 },
//   country: { left: 0, top: 0, width: 1603, height: 1001 },
// };

// const scanPaths = ["path.to.img.jpg", "path.to.img2.jpg"];

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
    console.log(req);
    fs.readFile(`./uploads/${req.file.originalname}`, (err, data) => {
      if (err) return console.log("This is your error", err);

      //       worker
      //         .recognize(data, "eng", { tessjs_create_pdf: "1" })
      //         .progress((progress) => {
      //           console.log(progress);
      //         })
      //         .then((result) => {
      //           res.redirect("/download");
      //         })
      //         .finally(() => worker.terminate());
      //     });
      //   });
      // });

      // const buildNoteObject = async () => {
      //   await worker.load();
      //   await worker.loadLanguage("eng");
      //   await worker.initialize("eng");
      //   const notes = [];
      //   const rectangles = Object.keys(rectangleKeys);
      //   for (let i = 0; i < scanPaths.length; i++) {
      //     const note = {};
      //     const currentScanPath = scanPaths[i];
      //     for (let i = 0; i < rectangles.length; i++) {
      //       const key = rectangleKeys[i];
      //       const {
      //         data: { text },
      //       } = await worker.recognize(currentScanPath, {
      //         rectangle: rectangleKeys[key],
      //       });
      //       note[key] = text;
      //     }
      //     notes.push(note);
      //   }
      //   const notesJson = JSON.stringify(notes);
      //   fs.writeFileSync("./notes.json", notesJson);
      //   await worker.terminate();
      // };

      (async () => {
        await worker.load();
        await worker.loadLanguage("eng");
        await worker.initialize("eng");
        // await worker.setParameters({
        //   tessedit_pageseg_mode: PSM.AUTO,
        // });
        const {
          data: { text },
        } = await worker.recognize(data);
        console.log(text);

        const { data: pdfData } = await worker.getPDF("Tesseract OCR Result");
        fs.writeFileSync("${req.file.originalname}.pdf", Buffer.from(pdfData));
        console.log("Generate PDF: ${req.file.originalname}.pdf");

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
app.listen(PORT, () => console.log("Hey I am running on port", PORT));
