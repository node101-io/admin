const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Project.findProjectCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Project.findProjectsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('project/delete', {
        page: 'project/delete',
        title: res.__('Deleted Projects'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        projects_count: count,
        projects_search: data.search,
        projects_limit: data.limit,
        projects_page: data.page,
        projects: data.projects
      });
    });
  });
}
