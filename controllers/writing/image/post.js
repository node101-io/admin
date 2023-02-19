const Writing = require('../../../models/writing/Writing');

module.exports = (req, res) => {
  Writing.uploadWritingContentImage(req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};