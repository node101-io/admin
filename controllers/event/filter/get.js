const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Event.findEventsByFilters(req.query, (err, data) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, events: data.events }));
    return res.end();
  });
};