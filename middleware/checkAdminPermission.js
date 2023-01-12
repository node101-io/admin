module.exports = (req, res, next) => {
  const permission = {
    '/blog': 'blog_view',
    '/blog/create': 'blog_create',
    '/blog/delete': 'blog_delete',
    '/blog/edit': 'blog_edit',
    '/blog/image': 'blog_edit',
    '/blog/restore': 'blog_delete',
    '/blog/order': 'blog_edit',
    '/book/x': 'book_view',
    '/book/create': 'book_create',
    '/book/delete': 'book_delete',
    '/book/edit': 'book_edit',
    '/book/image': 'book_edit',
    '/book/restore': 'book_delete',
    '/book/order': 'book_edit',
    '/guide/x': 'guide_view',
    '/guide/create': 'guide_create',
    '/guide/delete': 'guide_delete',
    '/guide/edit': 'guide_edit',
    '/guide/image': 'guide_edit',
    '/guide/restore': 'guide_delete',
    '/guide/order': 'guide_edit',
    '/member/x': 'member_view',
    '/member/create': 'member_create',
    '/member/delete': 'member_delete',
    '/member/edit': 'member_edit',
    '/member/image': 'member_edit',
    '/member/restore': 'member_delete',
    '/member/order': 'member_edit',
    '/project/x': 'project_view',
    '/project/create': 'project_create',
    '/project/delete': 'project_delete',
    '/project/edit': 'project_edit',
    '/project/image': 'project_edit',
    '/project/restore': 'project_delete',
    '/project/order': 'project_edit',
    '/stake/x': 'stake_view',
    '/stake/create': 'stake_create',
    '/stake/delete': 'stake_delete',
    '/stake/edit': 'stake_edit',
    '/stake/image': 'stake_edit',
    '/stake/restore': 'stake_delete',
    '/stake/order': 'stake_edit',
    '/writer/x': 'writer_view',
    '/writer/create': 'writer_create',
    '/writer/delete': 'writer_delete',
    '/writer/edit': 'writer_edit',
    '/writer/image': 'writer_edit',
    '/writer/restore': 'writer_delete',
    '/writer/order': 'writer_edit'
  };

  const route = req.originalUrl.split('?')[0];

  if (!permission[route] || !req.session.admin.roles.includes(permission[route]))
    return res.redirect('/');

  return next();
};