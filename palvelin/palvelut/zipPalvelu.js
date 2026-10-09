const archiver = require("archiver");
const { haeKansio } = require("./galleriaPalvelu");

function luoZip(asiakasId, res) {
  const kansio = haeKansio(asiakasId);
  const zip = archiver("zip", { zlib: { level: 9 } });

  zip.on("error", err => { throw err });

  res.attachment(`${asiakasId}-galleria.zip`);

  zip.pipe(res);
  zip.directory(kansio, false);
  zip.finalize();
}

module.exports = { luoZip };
