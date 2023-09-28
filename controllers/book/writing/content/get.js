const DEFAULT_WRITING_LANGUAGE = 'en';

const Book = require('../../../../models/book/Book');

module.exports = (req, res) => {
  const translations = {
    en: res.__('English'),
    tr: res.__('Turkish'),
    ru: res.__('Russian')
  };
  const translate = req.query.translate && translations[req.query.translate] ? req.query.translate : DEFAULT_WRITING_LANGUAGE;

  if (translate && translate != DEFAULT_WRITING_LANGUAGE) {
    Book.findBookByIdAndFormatByLanguage(req.query.id, translate, (err, book) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Book.findBookByIdAndGetWritingByIdAndFormatByLanguage(req.query.id, req.query.writing_id, translate, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('book/writing/content', {
          page: 'book/writing/content',
          title: `${res.__('Edit Writing')} - ${writing.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
            }
          },
          translations,
          book,
          writing,
          translate
        });
      });
    });
  } else {
    Book.findBookByIdAndFormat(req.query.id, (err, book) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Book.findBookByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('book/writing/content', {
          page: 'book/writing/content',
          title: `${res.__('Edit Writing')} - ${writing.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
            }
          },
          translations,
          book,
          writing,
          translate: DEFAULT_WRITING_LANGUAGE
        });
      });
    });
  }
};
