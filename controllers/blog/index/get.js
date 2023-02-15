const Blog = require('../../../models/blog/Blog');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Blog.findBlogCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Blog.findBlogsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('blog/index', {
        page: 'blog/index',
        title: res.__('Blogs'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        blogs_count: count,
        blogs_search: data.search,
        blogs_limit: data.limit,
        blogs_page: data.page,
        blogs: data.blogs
      });
    });
  });
};
