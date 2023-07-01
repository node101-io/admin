const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndUpdateImage(req.query.id, req.file, (err, project) => {
    if (err) return res.json({ success: false, error: err })

    return res.json({ success: true, project });
  });
};