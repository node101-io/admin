module.exports = (req, res, next) => {
  const permission = {
    '/blog': 'blog_view',
    '/blog/create': 'blog_create',
    '/blog/delete': 'blog_delete',
    '/blog/edit': 'blog_edit',
    '/blog/image': 'blog_edit',
    '/blog/restore': 'blog_delete',
    '/blog/order': 'blog_edit',
    '/blog/translate': 'blog_edit',
    '/blog/writing': 'blog_view',
    '/blog/writing/content': 'blog_edit',
    '/blog/writing/cover': 'blog_create',
    '/blog/writing/create': 'blog_create',
    '/blog/writing/delete': 'blog_delete',
    '/blog/writing/edit': 'blog_edit',
    '/blog/writing/image': 'blog_edit',
    '/blog/writing/restore': 'blog_delete',
    '/blog/writing/order': 'blog_edit',
    '/blog/writing/translate': 'blog_edit',
    '/book': 'book_view',
    '/book/create': 'book_create',
    '/book/delete': 'book_delete',
    '/book/edit': 'book_edit',
    '/book/image': 'book_edit',
    '/book/restore': 'book_delete',
    '/book/order': 'book_edit',
    '/book/translate': 'book_edit',
    '/guide': 'guide_view',
    '/guide/create': 'guide_create',
    '/guide/delete': 'guide_delete',
    '/guide/edit': 'guide_edit',
    '/guide/image': 'guide_edit',
    '/guide/restore': 'guide_delete',
    '/guide/order': 'guide_edit',
    '/guide/translate': 'guide_edit',
    '/member': 'member_view',
    '/member/create': 'member_create',
    '/member/delete': 'member_delete',
    '/member/edit': 'member_edit',
    '/member/image': 'member_edit',
    '/member/restore': 'member_delete',
    '/member/order': 'member_edit',
    '/member/translate': 'member_edit',
    '/project': 'project_view',
    '/project/create': 'project_create',
    '/project/delete': 'project_delete',
    '/project/edit': 'project_edit',
    '/project/filter': 'project_view',
    '/project/image': 'project_edit',
    '/project/restore': 'project_delete',
    '/project/order': 'project_edit',
    '/project/translate': 'project_edit',
    '/stake': 'stake_view',
    '/stake/create': 'stake_create',
    '/stake/delete': 'stake_delete',
    '/stake/edit': 'stake_edit',
    '/stake/image': 'stake_edit',
    '/stake/restore': 'stake_delete',
    '/stake/order': 'stake_edit',
    '/stake/translate': 'stake_edit',
    '/writer': 'writer_view',
    '/writer/create': 'writer_create',
    '/writer/delete': 'writer_delete',
    '/writer/edit': 'writer_edit',
    '/writer/filter': 'writer_view',
    '/writer/image': 'writer_edit',
    '/writer/restore': 'writer_delete',
    '/writer/order': 'writer_edit',
    '/writer/translate': 'writer_edit'
  };

  const route = req.originalUrl.split('?')[0];

  if (!permission[route] || !req.session.admin.roles.includes(permission[route]))
    return res.redirect('/');

  return next();
};