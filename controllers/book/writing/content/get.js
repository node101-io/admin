const DEFAULT_WRITING_LANGUAGE = 'en';

const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  const translations = {
    en: res.__('English'),
    tr: res.__('Turkish'),
    ru: res.__('Russian')
  };
  const translate = req.query.translate && translations[req.query.translate] ? req.query.translate : DEFAULT_WRITING_LANGUAGE;

  if (!req.query.type || req.query.type != 'chapter') {
    if (translate && translate != DEFAULT_WRITING_LANGUAGE) {
      Book.findBookByIdAndFormatByLanguage(req.query.id, translate, (err, parent) => {
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
            parent,
            writing,
            translate
          });
        });
      });
    } else {
      Book.findBookByIdAndFormat(req.query.id, (err, parent) => {
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
            parent,
            writing,
            translate: DEFAULT_WRITING_LANGUAGE
          });
        });
      });
    }
  } else {
    if (translate && translate != DEFAULT_WRITING_LANGUAGE) {
      Chapter.findChapterByIdAndFormatByLanguage(req.query.id, translate, (err, parent) => {
        if (err) return res.redirect('/error?message=' + err);
    
        Chapter.findChapterByIdAndGetWritingByIdAndFormatByLanguage(req.query.id, req.query.writing_id, translate, (err, writing) => {
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
            parent_type: 'chapter',
            translations,
            parent,
            writing,
            translate
          });
        });
      });
    } else {
      Chapter.findChapterByIdAndFormat(req.query.id, (err, parent) => {
        if (err) return res.redirect('/error?message=' + err);
    
        Chapter.findChapterByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
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
            parent_type: 'chapter',
            translations,
            parent,
            writing,
            translate: DEFAULT_WRITING_LANGUAGE
          });
        });
      });
    }
  }
};
