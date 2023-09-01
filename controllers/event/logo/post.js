const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  Event.findEventByIdAndUpdateLogo(req.query.id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};