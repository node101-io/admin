const Tag = require('../../../models/tag/Tag');

module.exports = (req, res) => {
  Tag.createTag(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
};