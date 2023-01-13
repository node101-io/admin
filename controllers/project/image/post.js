const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndUpdateImage(req.query.id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};