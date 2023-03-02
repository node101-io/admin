const Book = require('../../../models/book/Book');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Book.findBookCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Book.findBooksByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('book/delete', {
        page: 'book/delete',
        title: res.__('Deleted Books'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        books_count: count,
        books_search: data.search,
        books_limit: data.limit,
        books_page: data.page,
        books: data.books
      });
    });
  });
}
