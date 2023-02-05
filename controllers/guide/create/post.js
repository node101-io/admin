const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  Guide.createGuide(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
};