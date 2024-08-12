const escpos = require("escpos");
escpos.USB = require("escpos-usb");
const path = require("path");
const joinImages = require("join-images");
const fs = require("fs");
const imageConversion = require("image-conversion");

function init() {
  // Select the adapter based on your printer type
  const device = new escpos.USB();
  const options = { encoding: "utf8" /* default */ };
  // encoding is optional
  const printer = new escpos.Printer(device, options);
  return { device, printer };
}

module.exports.printFaceBody = async function printFaceBody(
  title,
  patient_name,
  face_image,
  body_image
) {
  try {
    // init
    const { device, printer } = init();
    // prepare directory
    const outdir = path.join(__dirname, "./images/");
    if (!fs.existsSync(outdir)) {
      console.log("Creating images Directory");
      fs.mkdirSync(outdir);
    } else {
      console.log("Directory already exist");
    }
    // image converter
    const icFace = await imageConversion.dataURLtoFile(face_image, "image/png");
    const icBody = await imageConversion.dataURLtoFile(body_image, "image/png");
    // Save the raw file for each asset to the current working directory
    let face_body_image_name =
      outdir + "face-body-" + new Date().getTime() + ".png";
    await joinImages
      .joinImages([await icFace.arrayBuffer(), await icBody.arrayBuffer()], {
        direction: "vertical",
      })
      .then(async (img) => {
        console.log("saving combined images");
        // Save image as file
        await img.toFile(face_body_image_name);
      });
    console.log(`Mulai print 1 ${face_body_image_name}`);
    /* ==== */
    escpos.Image.load(face_body_image_name, (image, error) => {
      if (error) {
        console.log("error loading image");
        throw error;
      }
      //
      device.open(async function (error) {
        if (error) {
          console.log("error open device");
          throw error;
        }
        await printer
          .font("b")
          .align("ct")
          .size(1, 1)
          .text(title)
          .text(patient_name)
          .image(image, "D24")
          .then(() => {
            printer.beep(1).cut().close();
          });
      });
    });
    /* ==== */

    /* DELETE FILE IMAGES AFTER PRINT */
    fs.unlink(face_body_image_name, (err) => {
      if (err) throw err;
      console.log(`${face_body_image_name} was deleted`);
    });
    /* END DELETE FILE IMAGES AFTER PRINT */
  } catch (error) {
    throw error;
  }
};

module.exports.printFarmasiSlip = async function printFarmasiSlip(
  doc_name,
  tanggal,
  patien_name,
  appointment_id,
  source_document,
  items = []
) {
  try {
    // init
    const { device, printer } = init();
    /* ==== */
    escpos.Image.load(
      path.join(__dirname, "logo-superskin2.png"),
      (image, error) => {
        if (error) {
          console.log("error loading image");
          throw error;
        }
        device.open(async function (error) {
          if (error) {
            console.log("error open device");
            throw error;
          }
          printer.align("CT").image(image, "D24");
          printer
            .newLine()
            .align("LT")
            .size(1, 1)
            .style("B")
            .text(doc_name, "cp857")
            .size(0.5, 0.5)
            .style("NORMAL")
            .font("A")
            .text(tanggal)
            .newLine();
          printer.tableCustom([
            { text: "Nama", align: "LEFT", width: 0.4 },
            { text: `: ${patien_name}`, align: "LEFT", width: 0.6 },
          ]);
          printer.tableCustom([
            { text: "Appointment ID", align: "LEFT", width: 0.4 },
            { text: `: ${appointment_id}`, align: "LEFT", width: 0.6 },
          ]);
          printer.tableCustom([
            { text: "Source Document", align: "LEFT", width: 0.4 },
            { text: `: ${source_document}`, align: "LEFT", width: 0.6 },
          ]);
          printer.drawLine();
          printer
            .font("A")
            .style("B")
            .tableCustom(
              [
                { text: "No", align: "LEFT", width: 0.07 },
                { text: "Product", align: "LEFT", width: 0.5 },
                { text: "Reserved", align: "CENTER", width: 0.2 },
                { text: "UoM", align: "CENTER", width: 0.2 },
              ],
              { encoding: "cp857" }
            );
          printer.drawLine();

          items.forEach(function (data, index) {
            printer
              .font("A")
              .style("NORMAL")
              .tableCustom(
                [
                  { text: data.no, align: "LEFT", width: 0.07 },
                  { text: data.product_name, align: "LEFT", width: 0.5 },
                  {
                    text: `${data.reserved_uom_qty}`,
                    align: "CENTER",
                    width: 0.2,
                  },
                  { text: " " + data.uom, align: "LEFT", width: 0.2 },
                ],
                { encoding: "cp857" }
              );
          });
          printer.feed(2).cut().close();
        });
      }
    );
    /* ==== */
  } catch (error) {
    throw error;
  }
};
