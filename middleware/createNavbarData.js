module.exports = (req, res, next) => {
  const allMenuData = {
    'Blogs': [
      { permission: 'blog_view', name: res.__('All Blogs'), link: '/blog' },
      { permission: 'blog_create', name: res.__('New Blog'), link: '/blog/create' },
      { permission: 'blog_delete', name: res.__('Deleted Blogs'), link: '/blog/delete' }
    ],
    'Books': [
      { permission: 'book_view', name: res.__('All Books'), link: '/book' },
      { permission: 'book_create', name: res.__('New Book'), link: '/book/create' },
      { permission: 'book_delete', name: res.__('Deleted Books'), link: '/book/delete' }
    ],
    'Events': [
      { permission: 'event_view', name: res.__('All Events'), link: '/event' },
      { permission: 'event_create', name: res.__('New Event'), link: '/event/create' },
      { permission: 'event_delete', name: res.__('Deleted Events'), link: '/event/delete' }
    ],
    'Guides': [
      { permission: 'guide_view', name: res.__('All Guides'), link: '/guide' },
      { permission: 'guide_create', name: res.__('New Guide'), link: '/guide/create' },
      { permission: 'guide_delete', name: res.__('Deleted Guides'), link: '/guide/delete' }
    ],
    'Klein': [
      { permission: 'wizard_view', name: res.__('Klein Version Controller'), link: '/wizard' }
    ],
    'Projects': [
      { permission: 'project_view', name: res.__('All Projects'), link: '/project' },
      { permission: 'project_create', name: res.__('New Project'), link: '/project/create' },
      { permission: 'project_delete', name: res.__('Deleted Projects'), link: '/project/delete' }
    ],
    'Tags': [
      { permission: 'tag_view', name: res.__('All Library Tags'), link: '/tag' },
      { permission: 'tag_create', name: res.__('New Tag'), link: '/tag/create' }
    ],
    'Team Members': [
      { permission: 'member_view', name: res.__('All Members'), link: '/member' },
      { permission: 'member_create', name: res.__('New Member'), link: '/member/create' },
      { permission: 'member_delete', name: res.__('Deleted Members'), link: '/member/delete' }
    ],
    'Writers': [
      { permission: 'writer_view', name: res.__('All Writers'), link: '/writer' },
      { permission: 'writer_create', name: res.__('New Writer'), link: '/writer/create' },
      { permission: 'writer_delete', name: res.__('Deleted Writers'), link: '/writer/delete' }
    ]
  };

  const route = req.originalUrl.split('?')[0];
  const admin = req.session.admin;
  const menu = {};

  Object.keys(allMenuData).forEach(key => {
    allMenuData[key].forEach(page => {
      if (admin.roles.includes(page.permission)) {
        if (!menu[key])
          menu[key] = [];

        const newPage = {
          name: page.name,
          link: page.link
        };

        if (page.link == route)
          newPage.selected = true;

        menu[key].push(newPage);
      };
    });
  });

  console.log(admin.image);
  res.locals.navbar = {
    title: admin.name,
    subtitle: admin.email,
    image: admin.image ? admin.image : '/images/default.png',
    logout: '/auth/logout',
    menu
  };
  res.locals.admin = req.session.admin;

  return next();
}