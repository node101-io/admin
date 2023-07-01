const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

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

  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndFormat(req.query.id, (err, parent) => {
      if (err) return res.redirect('/error?message=' + err);

      Book.findBookByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
    
        return res.render('book/writing/edit', {
          page: 'book/writing/edit',
          title: writing.name,
          includes: {
            external: {
              css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
            }
          },
          parent,
          writing,
          labels,
          socialAccounts
        });
      });
    });
  else
    Chapter.findChapterByIdAndFormat(req.query.id, (err, parent) => {
      if (err) return res.redirect('/error?message=' + err);

      Chapter.findChapterByIdAndGetWritingByIdAndFormat(req.query.id, req.query.writing_id, (err, writing) => {
        if (err) return res.redirect('/error?message=' + err);
    
        return res.render('book/writing/edit', {
          page: 'book/writing/edit',
          title: writing.name,
          includes: {
            external: {
              css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
            }
          },
          parent_type: 'chapter',
          parent,
          writing,
          labels,
          socialAccounts
        });
      });
    });
};
