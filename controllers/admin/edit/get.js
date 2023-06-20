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
    'guide_view': res.__('View Guides'),
    'guide_create': res.__('Create New Guides'),
    'guide_edit': res.__('Edit & Translate Guides'),
    'guide_order': res.__('Change the Order of Guides'),
    'guide_delete': res.__('Delete & Restore Guides'),
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
    'tag_view': res.__('View Library Tags'),
    'tag_create': res.__('Create New Tags'),
    'tag_edit': res.__('Edit & Translate Tags'),
    'tag_order': res.__('Change the Order of Tags'),
    'tag_delete': res.__('Delete Tags'),
    'wizard_view': res.__('View Wizard App Versions'),
    'wizard_edit': res.__('Publish New Wizard App Versions'),
    'writer_view': res.__('View Writers'),
    'writer_create': res.__('Create New Writers'),
    'writer_edit': res.__('Edit & Translate Writers'),
    'writer_order': res.__('Change the Order of Writers'),
    'writer_delete': res.__('Delete & Restore Writers')
  };

  Admin.findAdminByIdAndFormat(req.query.id, (err, admin) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('admin/edit', {
      page: 'admin/edit',
      title: res.__('System Admin Dashboard'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
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
