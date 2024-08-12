// const escpos = require("escpos");
// escpos.USB = require("escpos-usb");
// const device = new escpos.USB();
// const options = require("../printer_options");
// const printer = new escpos.Printer(device, options);
const express = require("express");
const router = express.Router();
const { validationResult, body } = require("express-validator");
const fs = require("fs");
const { printFaceBody, printFarmasiSlip } = require("./super_skin_print");

// can be reused by many routes
const validateInput = (validations) => {
  return async (req, res, next) => {
    // sequential processing, stops running validations chain if one fails.
    for (const validation of validations) {
      const result = await validation.run(req);
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      }
    }

    next();
  };
};

// Endpoint for printing body and face data
// parameter {title, patient_name, face = dataURL, body = dataURL}
router.post(
  "/face-body",
  validateInput([
    body("title").notEmpty(),
    body("patient_name").notEmpty(),
    body("face").notEmpty(),
    body("body").notEmpty(),
  ]),
  async (req, res) => {
    try {
      printFaceBody(
        req.body.title,
        req.body.patient_name,
        req.body.face,
        req.body.body
      );
      //
      return res.status(200).json({ status: "success" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ msg: "Bad request." });
    }
  }
);

router.post("/print-farmasi-slip", async (req, res) => {
  try {
    // console.log(req.body);
    printFarmasiSlip(
      req.body.doc_name,
      req.body.tanggal,
      req.body.patien_name,
      req.body.appointment_id,
      req.body.source_document,
      req.body.items
    );
    //
    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ msg: "Bad request." });
  }
});
//
module.exports = router;
