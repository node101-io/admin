const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  const roles = {
    'blog_view': res.__('View Blogs'),
    'blog_create': res.__('Create New Blogs'),
    'blog_edit': res.__('Edit & Translate Blogs'),
    'blog_order': res.__('Change the Order of Blogs'),
    'blog_delete': res.__('Delete & Restore Blogs'),
    'book_view': res.__('View Books'),
    'book_create': res.__('Create New Books'),
    'book_edit': res.__('Edit & Translate Books'),
    'book_order': res.__('Change the Order of Books'),
    'book_delete': res.__('Delete & Restore Books'),
    'guide_view': res.__('View Testnet Guides'),
    'guide_create': res.__('Create New Testnet Guides'),
    'guide_edit': res.__('Edit & Translate Testnet Guides'),
    'guide_order': res.__('Change the Order of Testnet Guides'),
    'guide_delete': res.__('Delete & Restore Testnet Guides'),
    'member_view': res.__('View node101 Members'),
    'member_create': res.__('Create New node101 Members'),
    'member_edit': res.__('Edit & Translate node101 Members'),
    'member_order': res.__('Change the Order of node101 Members'),
    'member_delete': res.__('Delete & Restore node101 Members'),
    'project_view': res.__('View Projects'),
    'project_create': res.__('Create New Projects'),
    'project_edit': res.__('Edit & Translate Projects'),
    'project_order': res.__('Change the Order of Projects'),
    'project_delete': res.__('Delete & Restore Projects'),
    'stake_view': res.__('View Stakable Projects'),
    'stake_create': res.__('Create New Stakable Projects'),
    'stake_edit': res.__('Edit & Translate Stakable Projects'),
    'stake_order': res.__('Change the Order of Stakable Projects'),
    'stake_delete': res.__('Delete & Restore Stakable Projects'),
    'writer_view': res.__('View Writers'),
    'writer_create': res.__('Create New Writers'),
    'writer_edit': res.__('Edit & Translate Writers'),
    'writer_order': res.__('Change the Order of Writers'),
    'writer_delete': res.__('Delete & Restore Writers'),
    'writing_view': res.__('View Writings (from Blogs & Books)'),
    'writing_create': res.__('Create New Writings (from Blogs & Books)'),
    'writing_edit': res.__('Edit & Translate Writings (from Blogs & Books)'),
    'writing_order': res.__('Change the Order of Writings (from Blogs & Books)'),
    'writing_delete': res.__('Delete & Restore Writings (from Blogs & Books)')
  };

  Admin.findAdminByIdAndFormat(req.query.id, (err, admin) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('admin/edit', {
      page: 'admin/edit',
      title: res.__('System Admin Dashboard'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'formUtilityFunctions', 'page', 'serverRequest']
        }
      },
      navbar: {
        title: res.__('System Admin'),
        subtitle: res.__('Create and edit admin user accounts.'),
        logout: '/admin/logout',
        menu: {
          'Users': [
            { name: res.__('All Users'), link: '/admin' },
            { name: res.__('New User'), link: '/admin/create' }
          ]
        }
      },
      admin,
      roles
    });
  });
};
