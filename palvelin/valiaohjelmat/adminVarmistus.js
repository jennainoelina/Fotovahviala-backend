function adminVarmistus(req, res, next) {
  if (req.session && req.session.onAdmin) {
    return next();
  }
  return res.status(401).json({ viesti: "Ei oikeuksia" });
}

module.exports = { adminVarmistus };
