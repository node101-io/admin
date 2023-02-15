const Writer = require('../../../models/writer/Writer');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Writer.findWritersByFilters(req.query, (err, data) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, writers: data.writers }));
    return res.end();
  });
};