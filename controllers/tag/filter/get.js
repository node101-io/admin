const Tag = require('../../../models/tag/Tag');

module.exports = (req, res) => {
  Tag.findTagsByFilters(req.query, (err, data) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, tags: data.tags }));
    return res.end();
  });
};