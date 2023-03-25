const Guide = require('../../../../models/guide/Guide');

module.exports = (req, res) => {
  Guide.findGuideByIdAndGetWritingAndUpdateTranslations(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
}