module.exports = (req, res) => {
  return res.json({
    error: req.query.message ? req.query.message : 'unknown_error'
  });
}
