const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  Event.createEvent(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err}));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id}));
    return res.end();
  });
};