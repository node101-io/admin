const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndUpdateStake(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};