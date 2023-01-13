const Writer = require('../../../models/writer/Writer');

module.exports = (req, res) => {
  Writer.findWriterByIdAndUpdateImage(req.query.id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};