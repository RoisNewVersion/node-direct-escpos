"user strict";
const path = require("path");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const device = new escpos.USB();
const options = require("./printer_options");
const printer = new escpos.Printer(device, options);
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const morgan = require("morgan");
const app = express();
//
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);
app.use(morgan("dev"));
// set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// route superskin
const super_skin = require("./routes/super_skin");
app.use("/super-skin", super_skin);

const port = 8181;

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/test-print", (req, res) => {
  res.status(200).json({ status: "success" });
  console.log(req.body);
  print(req.body.text);
});

app.listen(port, () => {
  console.log(`Direct printing server starting at http://localhost:${port}`);
});

const print = (text) => {
  device.open(async function (error) {
    if (error) {
      console.log("error open device");
      throw error;
    }
    printer
      .font("b")
      .align("ct")
      //   .style("bu")
      .text(text)
      .drawLine()
      .size(0.5, 0.5)
      .text("The quick brown fox jumps over the lazy dog")
      .size(1, 1)
      .font("b")
      .barcode("1234567", "EAN8")
      .feed(2)
      .cut()
      .close();
  });
};
