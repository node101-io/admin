module.exports = (req, res, next) => {
  const allMenuData = {
    'Blogs': [
      { permission: 'blog_view', name: res.__('All Blogs'), link: '/blogs' },
      { permission: 'blog_create', name: res.__('New Blog'), link: '/blogs/create' },
      { permission: 'blog_delete', name: res.__('Deleted Blogs'), link: '/blogs/delete' }
    ],
    'Books': [
      { permission: 'book_view', name: res.__('All Books'), link: '/books' },
      { permission: 'book_create', name: res.__('New Book'), link: '/books/create' },
      { permission: 'book_delete', name: res.__('Deleted Books'), link: '/blbooksobooksgs/delete' }
    ],
    'Projects': [
      { permission: 'project_view', name: res.__('All Projects'), link: '/projects' },
      { permission: 'project_create', name: res.__('New Project'), link: '/projects/create' },
      { permission: 'project_delete', name: res.__('Deleted Projects'), link: '/projects/delete' }
    ],
    'Stakable Projects': [
      { permission: 'stake_view', name: res.__('All Stake Projects'), link: '/stakes' },
      { permission: 'stake_create', name: res.__('New Stake Project'), link: '/stakes/create' },
      { permission: 'stake_delete', name: res.__('Deleted Stake Projects'), link: '/stakes/delete' }
    ],
    'Testnet Guides': [
      { permission: 'guide_view', name: res.__('All Guides'), link: '/guides' },
      { permission: 'guide_create', name: res.__('New Guide'), link: '/guides/create' },
      { permission: 'guide_delete', name: res.__('Deleted Guides'), link: '/guides/delete' }
    ],
    'Team Members': [
      { permission: 'member_view', name: res.__('All Members'), link: '/members' },
      { permission: 'member_create', name: res.__('New Member'), link: '/members/create' },
      { permission: 'member_delete', name: res.__('Deleted Members'), link: '/members/delete' }
    ],
    'Writers': [
      { permission: 'writer_view', name: res.__('All Writers'), link: '/writers' },
      { permission: 'writer_create', name: res.__('New Writers'), link: '/writers/create' },
      { permission: 'writer_delete', name: res.__('Deleted Writers'), link: '/writers/delete' }
    ]
  };

  const admin = req.session.admin;
  const menu = {};

  Object.keys(allMenuData).forEach(key => {
    allMenuData[key].forEach(page => {
      if (admin.roles.includes(page.permission)) {
        if (!menu[key])
          menu[key] = [];

        menu[key].push({
          name: page.name,
          link: page.link
        });
      };
    });
  });

  res.locals.navbar = {
    title: admin.name,
    subtitle: admin.email,
    image: admin.image,
    logout: '/auth/logout',
    menu
  };

  return next();
}