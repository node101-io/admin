const DEFAULT_WRITING_LANGUAGE = 'en';

const Guide = require('../../../../models/guide/Guide');

module.exports = (req, res) => {
  const translations = {
    en: res.__('English'),
    tr: res.__('Turkish'),
    ru: res.__('Russian')
  };
  const translate = req.query.translate && translations[req.query.translate] ? req.query.translate : DEFAULT_WRITING_LANGUAGE;

  if (translate && translate != DEFAULT_WRITING_LANGUAGE) {
    Guide.findGuideByIdAndFormatByLanguage(req.query.id, translate, (err, guide) => {
      if (err) return res.redirect('/error?message=' + err);
  
      return res.render('guide/writing', {
        page: 'guide/writing',
        title: `${res.__('Edit Guide Content')} - ${guide.title}`, 
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
            js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
          }
        },
        translations,
        guide,
        writing: guide.writing,
        translate
      });
    });
  } else {
    Guide.findGuideByIdAndFormat(req.query.id, (err, guide) => {
      if (err) return res.redirect('/error?message=' + err);
  
      return res.render('guide/writing', {
        page: 'guide/writing',
        title: `${res.__('Edit Guide Content')} - ${guide.title}`, 
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'highlight.js', 'items', 'navbar', 'navigation', 'text', 'writing'],
            js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'highlight.js', 'generateRandomHEX', 'navbarListeners', 'page', 'serverRequest', 'writing']
          }
        },
        translations,
        guide,
        writing: guide.writing,
        translate: DEFAULT_WRITING_LANGUAGE
      });
    });
  }
}