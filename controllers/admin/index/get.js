module.exports = (req, res) => {
  return res.render('admin/index', {
    page: 'admin/index',
    title: res.__('System Admin Dashboard'),
    includes: {
      external: {
        css: ['form', 'general', 'header', 'page', 'text'],
        js: ['page']
      }
    },
    header: {
      title: res.__('System Admin'),
      subtitle: res.__('Create and edit admin user accounts'),
      menu: {
        'Users': [
          { name: res.__('All Users'), link: '/admin', selected: true },
          { name: res.__('New Admin'), link: '/admin/create' }
        ]
      }
    }
  });
}
