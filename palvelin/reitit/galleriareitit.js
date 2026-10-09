console.log("galleriareitit ladattu");

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
console.log(archiver);

// ASIAKAS: hae kuvat
router.get("/kuvat", (req, res) => {
    console.log("SESSION:");
    console.log(req.session);
    const asiakasId = req.session.asiakasId;

    if (!asiakasId) {
        return res.status(401).json({
            viesti: "Ei kirjautunut"
        });
    }

    const kansioPolku = path.join(
        __dirname,
        "../julkinen/galleriat",
        asiakasId
    );

    if (!fs.existsSync(kansioPolku)) {
        return res.status(404).json({
            viesti: "Kansiota ei löytynyt"
        });
    }

    const kaikkiTiedostot = fs.readdirSync(kansioPolku);

    const kuvat = kaikkiTiedostot.filter(tiedosto =>
        tiedosto.toLowerCase().endsWith(".jpg") ||
        tiedosto.toLowerCase().endsWith(".jpeg") ||
        tiedosto.toLowerCase().endsWith(".png")
    );

    res.json({
        asiakasId,
        kuvat
    });
});

// ASIAKAS: lataa kuvat ZIP-pakettina
router.get("/zip", (req, res) => {
    console.log("ZIP-reitti kutsuttu");

    const asiakasId = req.session.asiakasId;

    if (!asiakasId) {
        return res.status(401).json({
            viesti: "Ei kirjautunut"
        });
    }

    const kansioPolku = path.join(
        __dirname,
        "../julkinen/galleriat",
        asiakasId
    );

    console.log("Kansio:", kansioPolku);

    if (!fs.existsSync(kansioPolku)) {
        return res.status(404).json({
            viesti: "Kansiota ei löytynyt"
        });
    }

    res.attachment(`${asiakasId}.zip`);

    const archive = archiver("zip", {
    zlib: { level: 9 }
    });

    archive.on("error", (err) => {
        console.error("ZIP-virhe:", err);
        res.status(500).send("ZIP-virhe");
    });

    archive.pipe(res);
    archive.directory(kansioPolku, false);
    archive.finalize();
});

module.exports = router;