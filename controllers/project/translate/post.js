const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndUpdateTranslations(req.query.id, req.body, (err, project) => {
    if (err) return res.json({ success: false, error: err })

    return res.json({ success: true, project });
  });
};