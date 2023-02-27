const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  const labels = {
    'none': res.__('None'),
    'slider': res.__('Slider'),
    'editors_pick': res.__('Editors Pick'),
    'exclusive': res.__('Exclusive')
  };
  const socialAccounts = {
    'medium': 'Medium',
    'youtube': 'Youtube',
    'spotify': 'Spotify'
  };

  Blog.findBlogByIdAndFormat(req.query.id, (err, blog) => {
    if (err) return res.redirect('/error?message=' + err);

    Blog.findBlogByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
      if (err) return res.redirect('/error?message=' + err);
  
      return res.render('blog/writing/edit', {
        page: 'blog/writing/edit',
        title: writing.name,
        includes: {
          external: {
            css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        blog,
        writing,
        labels,
        socialAccounts
      });
    });
  });
};
