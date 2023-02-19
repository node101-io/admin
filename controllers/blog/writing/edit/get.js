const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  const translations = {
    en: res.__('English'),
    tr: res.__('Turkish'),
    ru: res.__('Russian')
  };

  Blog.findBlogByIdAndFormat(req.query.id, (err, blog) => {
    if (err) return res.redirect('/error?message=' + err);

    Blog.findBlogByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('blog/writing/edit', {
        page: 'blog/writing/edit',
        title: `${res.__('Edit Writing')} - ${writing.title}`, 
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
            js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'navbarListeners', 'page', 'serverRequest', 'writing']
          }
        },
        translations,
        blog,
        writing,
        translate: req.query.translate && translations[req.query.translate] ? req.query.translate : 'en'
      });
    });
  });
};
