const Book = require('../../../../models/book/Book');

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

  Book.findBookByIdAndFormat(req.query.id, (err, book) => {
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
        book,
        writing,
        labels,
        socialAccounts
      });
    });
  });
};
