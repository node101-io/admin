const DEFAULT_WRITING_LANGUAGE = 'en';

const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  console.log(req.query)
  const translations = {
    en: res.__('English'),
    tr: res.__('Turkish'),
    ru: res.__('Russian')
  };
  const translate = req.query.translate && translations[req.query.translate] ? req.query.translate : DEFAULT_WRITING_LANGUAGE;

  if (translate && translate != DEFAULT_WRITING_LANGUAGE) {
    Blog.findBlogByIdAndFormatByLanguage(req.query.id, translate, (err, blog) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Blog.findBlogByIdAndGetWritingByIdAndFormatByLanguage(req.query.id, req.query.writing_id, translate, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('blog/writing/content', {
          page: 'blog/writing/content',
          title: `${res.__('Edit Writing')} - ${writing.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
            }
          },
          translations,
          blog,
          writing,
          translate
        });
      });
    });
  } else {
    Blog.findBlogByIdAndFormat(req.query.id, (err, blog) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Blog.findBlogByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('blog/writing/content', {
          page: 'blog/writing/content',
          title: `${res.__('Edit Writing')} - ${writing.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
            }
          },
          translations,
          blog,
          writing,
          translate: DEFAULT_WRITING_LANGUAGE
        });
      });
    });
  }
};
