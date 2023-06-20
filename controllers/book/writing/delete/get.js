const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Blog.findBlogByIdAndFormat(req.query.id, (err, blog) => {
    if (err) return res.redirect('/error?message=' + err);

    Blog.findBlogByIdAndGetWritingCountByFilters(req.query.id, req.query, (err, count) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Blog.findBlogByIdAndGetWritingsByFilters(req.query.id, req.query, (err, data) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('blog/writing/delete', {
          page: 'blog/writing/delete',
          title: `${res.__('Deleted Writings')} - ${blog.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'page', 'text'],
              js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
            }
          },
          blog,
          writings_count: count,
          writings_search: data.search,
          writings_limit: data.limit,
          writings_page: data.page,
          writings: data.writings
        });
      });
    });
  });
};
