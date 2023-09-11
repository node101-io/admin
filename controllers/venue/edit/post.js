const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  Venue.findVenueByIdAndUpdate(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};