const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  Guide.findGuideByIdAndIncOrderByOne(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};