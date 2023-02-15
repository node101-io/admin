const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Project.findProjectsByFilters(req.query, (err, data) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, projects: data.projects }));
    return res.end();
  });
};