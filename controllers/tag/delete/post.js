const Tag = require('../../../models/tag/Tag');

module.exports = (req, res) => {
  Tag.findTagByIdAndDelete(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};