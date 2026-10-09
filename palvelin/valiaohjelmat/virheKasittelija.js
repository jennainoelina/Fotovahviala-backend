function virheKasittelija(err, req, res, next) {
  console.error(err);
  res.status(err.status || 500).json({
    viesti: err.message || "Palvelinvirhe"
  });
}

module.exports = { virheKasittelija };
