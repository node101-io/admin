const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Project.findProjectCountByFilters(req.query, (err, count) => {
    if (err) return res.json({
      success: false,
      error: err
    });

    Project.findProjectsByFilters(req.query, (err, data) => {
      if (err) return res.json({
        success: false,
        error: err
      });

      return res.json({
        success: true,
        projects: data.projects,
        count,
        limit: data.limit,
        page: data.page,
        search: data.search
      });
    });
  });
}