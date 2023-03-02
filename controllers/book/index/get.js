const Book = require('../../../models/book/Book');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Book.findBookCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Book.findBooksByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('book/index', {
        page: 'book/index',
        title: res.__('Books'),
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
};
