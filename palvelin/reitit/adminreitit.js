const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

const multer = require("multer");
const { adminVarmistus } = require("../valiaohjelmat/adminVarmistus");
const { varmistaKansio, poistaKuva } = require("../palvelut/galleriaPalvelu");

const tallennus = multer.diskStorage({
  destination: (req, file, cb) => {
    const asiakasId = req.body.asiakasId;
    const kansio = varmistaKansio(asiakasId);
    cb(null, kansio);
  },
  filename: (req, file, cb) => {
    const nimi =
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "_");

    cb(null, nimi);
  }
});

const upload = multer({
  storage: tallennus
});

const GALLERIAT_POLKU = path.join(
    __dirname,
    "../julkinen/galleriat"
);

/*
====================================
Luo asiakas
====================================
*/
router.post("/luo-asiakas", async (req, res) => {

    try {

        const { asiakasId, salasana } = req.body;

        const asiakasKansio = path.join(
            GALLERIAT_POLKU,
            asiakasId
        );

        if (!fs.existsSync(asiakasKansio)) {
            fs.mkdirSync(asiakasKansio, {
                recursive: true
            });
        }

        const hash = await bcrypt.hash(
            salasana,
            10
        );

        fs.writeFileSync(
            path.join(
                asiakasKansio,
                "salasana.txt"
            ),
            hash
        );

        res.json({
            viesti: "Asiakas luotu ja salasana tallennettu"
        });

    } catch (virhe) {

        res.status(500).json({
            virhe: virhe.message
        });

    }

});

/*
====================================
Lataa kuvia asiakkaalle
====================================
*/
router.post(
  "/lataa",
  adminVarmistus,
  upload.array("kuvat", 50),
  (req, res) => {
    res.json({
      viesti: "Kuvat ladattu",
      tiedostot: req.files.map(f =>
        path.basename(f.path)
      )
    });
  }
);

/*
====================================
Hae kaikki asiakkaat
====================================
*/
router.get("/asiakkaat", (req, res) => {

    try {

        const asiakkaat = fs.readdirSync(
            GALLERIAT_POLKU
        ).filter(nimi => {

            const kohde = path.join(
                GALLERIAT_POLKU,
                nimi
            );

            return fs.statSync(kohde).isDirectory();
        });

        res.json(asiakkaat);

    } catch (virhe) {

        res.status(500).json({
            virhe: virhe.message
        });

    }

});

/*
====================================
Poista asiakkaan kuvat
====================================
*/
router.delete("/asiakkaat/:id/kuvat", (req, res) => {

    try {

        const asiakasKansio = path.join(
            GALLERIAT_POLKU,
            req.params.id
        );

        if (!fs.existsSync(asiakasKansio)) {

            return res.status(404).json({
                virhe: "Asiakasta ei löytynyt"
            });

        }

        const tiedostot = fs.readdirSync(
            asiakasKansio
        );

        tiedostot.forEach(tiedosto => {

            if (tiedosto === "salasana.txt") {
                return;
            }

            const tiedostoPolku = path.join(
                asiakasKansio,
                tiedosto
            );

            if (
                fs.statSync(
                    tiedostoPolku
                ).isFile()
            ) {
                fs.unlinkSync(
                    tiedostoPolku
                );
            }

        });

        res.json({
            viesti: "Kuvat poistettu"
        });

    } catch (virhe) {

        res.status(500).json({
            virhe: virhe.message
        });

    }

});

/*
====================================
Poista asiakas kokonaan
====================================
*/
router.delete("/asiakkaat/:id", (req, res) => {

    try {

        const asiakasKansio = path.join(
            GALLERIAT_POLKU,
            req.params.id
        );

        if (!fs.existsSync(asiakasKansio)) {

            return res.status(404).json({
                virhe: "Asiakasta ei löytynyt"
            });

        }

        fs.rmSync(asiakasKansio, {
            recursive: true,
            force: true
        });

        res.json({
            viesti: "Asiakas poistettu"
        });

    } catch (virhe) {

        res.status(500).json({
            virhe: virhe.message
        });

    }

});


module.exports = router;