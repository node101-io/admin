const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Project.findProjectsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('project/index', {
        page: 'project/index',
        title: res.__('System Project Dashboard'),
        includes: {
          external: {
            css: ['form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['projectListeners', 'createFormPopUp', 'serverRequest']
          }
        },
        navbar: {
          title: res.__('System Project'),
          subtitle: res.__('Create and edit project user accounts.'),
          menu: {
            'Users': [
              { name: res.__('All Users'), link: '/project', selected: true },
              { name: res.__('New User'), link: '/project/create' }
            ]
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
