const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Venue.findVenuesByFilters(req.query, (err, data) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, venues: data.venues }));
    return res.end();
  });
};