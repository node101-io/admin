module.exports = (req, res) => {
  if (!req.body || !req.body.password || req.body.password != process.env.ADMIN_PASSWORD) {
    res.write(JSON.stringify({ error: 'bad_request', success: false }));
    return res.end();
  }

  req.session.ADMIN_PASSWORD = req.body.password;

  res.write(JSON.stringify({ success: true }));
  return res.end();
}
