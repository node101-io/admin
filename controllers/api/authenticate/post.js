module.exports = (req, res) => {
  if (!req.body?.key || req.body.key != process.env.API_AUTHENTICATION_KEY)
    return res.json({
      success: false,
      error: 'bad_request'
    });

  req.session.API_AUTHENTICATION_KEY = req.body.key;

  return res.json({
    success: true
  });
};