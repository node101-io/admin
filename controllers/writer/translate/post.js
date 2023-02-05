const Writer = require('../../../models/writer/Writer');

module.exports = (req, res) => {
  Writer.findWriterByIdAndUpdateTranslations(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};