const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  Venue.findVenueByIdAndRestore(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};