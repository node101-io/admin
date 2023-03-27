const Guide = require('../../../../models/guide/Guide');

module.exports = (req, res) => {
  Guide.findGuideByIdAndGetWritingAndUpdateCover(req.query.id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
}