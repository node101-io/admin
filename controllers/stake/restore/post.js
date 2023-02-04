const Stake = require('../../../models/stake/Stake');

module.exports = (req, res) => {
  Stake.findStakeByIdAndRestore(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};