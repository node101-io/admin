module.exports = (req, res, next) => {
  if (req.session.API_AUTHENTICATION_KEY && req.session.API_AUTHENTICATION_KEY == process.env.API_AUTHENTICATION_KEY)
    return next();

  return res
    .status(401)
    .json({
      success: false,
      error: 'not_authenticated_request'
    });
};
