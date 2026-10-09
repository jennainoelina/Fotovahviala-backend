const fs = require("fs");
const path = require("path");
const { GALLERIA_POLKU } = require("../asetukset/palvelinasetukset");

function haeKansio(asiakasId) {
  return path.join(GALLERIA_POLKU, asiakasId);
}

function varmistaKansio(asiakasId) {
  const kansio = haeKansio(asiakasId);
  if (!fs.existsSync(kansio)) {
    fs.mkdirSync(kansio, { recursive: true });
  }
  return kansio;
}

function listaaKuvat(asiakasId) {
  const kansio = haeKansio(asiakasId);
  if (!fs.existsSync(kansio)) return [];
  return fs.readdirSync(kansio).filter(tiedosto => {
    const ext = path.extname(tiedosto).toLowerCase();
    return [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
  });
}

function poistaKuva(asiakasId, tiedosto) {
  const polku = path.join(haeKansio(asiakasId), tiedosto);
  if (fs.existsSync(polku)) {
    fs.unlinkSync(polku);
    return true;
  }
  return false;
}

module.exports = {
  haeKansio,
  varmistaKansio,
  listaaKuvat,
  poistaKuva
};
