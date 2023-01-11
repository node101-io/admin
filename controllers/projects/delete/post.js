const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndDelete(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};