const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  Admin.findAdminCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Admin.findAdminsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('admin/index', {
        page: 'admin/index',
        title: res.__('System Admin Dashboard'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
          }
        },
        navbar: {
          title: res.__('System Admin'),
          subtitle: res.__('Create and edit admin user accounts.'),
          logout: '/admin/logout',
          menu: {
            'Users': [
              { name: res.__('All Users'), link: '/admin', selected: true },
              { name: res.__('New User'), link: '/admin/create' }
            ]
          }
        },
        admins_count: count,
        admins_search: data.search,
        admins_limit: data.limit,
        admins_page: data.page,
        admins: data.admins
      });
    });
  });
}
