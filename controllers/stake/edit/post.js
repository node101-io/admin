const Stake = require('../../../models/stake/Stake');

module.exports = (req, res) => {
  Stake.findStakeByIdAndUpdate(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};