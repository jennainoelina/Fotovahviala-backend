const express = require("express");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const archiver = require("archiver");
const nodemailer = require("nodemailer");

const { ISTUNTO_SALAINEN } = require("./asetukset/palvelinasetukset");

const kirjautumisreitit = require("./reitit/kirjautumisreitit");
const adminreitit = require("./reitit/adminreitit");
const galleriareitit = require("./reitit/galleriareitit");

const app = express();

// FRONTENDIN PALVELU (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: ISTUNTO_SALAINEN,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use(cors({
    origin: "https://fotovahviala-frontend.vercel.app",
    credentials: true
}));

// ASIAKKAIDEN KUVAT
app.use(
    "/galleriat",
    express.static(path.join(__dirname, "julkinen", "galleriat"))
);

// API-REITIT
app.use("/api/kirjautuminen", kirjautumisreitit);
app.use("/api/admin", adminreitit);
app.use("/api/galleria", galleriareitit);

// YHTEYDENOTTOLOMAKE
app.post("/api/yhteydenotto", async (req, res) => {
    const { nimi, sahkoposti, viesti } = req.body;

    try {
      console.log("Lähetetään sähköpostia...");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: "jenna.vahviala@gmail.com",
                pass: "jupfakidzyhxrtuz"
            },
            tls: {
                rejectUnauthorized: false
            }
        });
        await transporter.verify();
        console.log("SMTP-yhteys OK");

        await transporter.sendMail({
            from: "jenna.vahviala@gmail.com",
            to: "fotovahviala@gmail.com",
            replyTo: sahkoposti,
            subject: `Yhteydenotto: ${nimi}`,
            text: `
              Nimi: ${nimi}
              Sähköposti: ${sahkoposti}

              Viesti:
              ${viesti}
              `
        });

        res.status(200).json({
            viesti: "Viesti lähetetty onnistuneesti."
        });

    } catch (virhe) {
        console.error("Sähköpostin lähetys epäonnistui:", virhe);

        res.status(500).json({
            viesti: "Sähköpostin lähetys epäonnistui."
        });
    }
});

// VIRHEKÄSITTELIJÄ
const { virheKasittelija } = require("./valiaohjelmat/virheKasittelija");
app.use(virheKasittelija);

// PALVELIN KÄYNTIIN
const PORTTI = process.env.PORT || 5000;

app.listen(PORTTI, () => {
    console.log(`Palvelin käynnissä portissa ${PORTTI}`);
});