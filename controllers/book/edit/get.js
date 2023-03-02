const Book = require('../../../models/book/Book');

module.exports = (req, res) => {
  const types = {
    'node101': res.__('node101'),
    'project': res.__('Project'),
    'terms': res.__('Terms')
  };
  const socialAccounts = {
    'medium': 'Medium',
    'youtube': 'Youtube',
    'spotify': 'Spotify'
  };

  Book.findBookByIdAndFormat(req.query.id, (err, book) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('book/edit', {
      page: 'book/edit',
      title: book.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      book,
      types,
      socialAccounts
    });
  });
};
