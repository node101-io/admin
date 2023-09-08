const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  Venue.createVenue(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err}));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id}));
    return res.end();
  });
};