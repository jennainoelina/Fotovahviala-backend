const express = require("express");
const bcrypt = require("bcrypt");
const { ADMIN_KAYTTAJA, ADMIN_SALASANA_HASH } = require("../asetukset/palvelinasetukset");

const router = express.Router();

// ADMIN KIRJAUTUMINEN
router.post("/admin", async (req, res) => {
    const { kayttaja, salasana } = req.body;

    if (kayttaja !== ADMIN_KAYTTAJA) {
        return res.status(401).json({ viesti: "Virheellinen käyttäjä" });
    }

    const ok = await bcrypt.compare(salasana, ADMIN_SALASANA_HASH);

    if (!ok) {
        return res.status(401).json({ viesti: "Virheellinen salasana" });
    }

    req.session.onAdmin = true;

    res.json({ viesti: "Kirjautuminen onnistui" });
});

// ASIAKAS KIRJAUTUMINEN
router.post("/asiakas", async (req, res) => {
    const { asiakasId, salasana } = req.body;

    const fs = require("fs");
    const path = require("path");

    const salasanaPolku = path.join(__dirname, "../julkinen/galleriat", asiakasId, "salasana.txt");

    if (!fs.existsSync(salasanaPolku)) {
        return res.status(404).json({ viesti: "Asiakasta ei löytynyt" });
    }

    const hash = fs.readFileSync(salasanaPolku, "utf8");

    const ok = await bcrypt.compare(salasana, hash);

    if (!ok) {
        return res.status(401).json({ viesti: "Väärä salasana" });
    }

    req.session.asiakasId = asiakasId;

    res.json({ viesti: "Kirjautuminen onnistui" });
});

module.exports = router;