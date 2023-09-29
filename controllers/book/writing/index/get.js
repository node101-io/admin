const Book = require('../../../../models/book/Book');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Book.findBookByIdAndFormat(req.query.id, (err, book) => {
    if (err) return res.redirect('/error?message=' + err);

    Book.findBookByIdAndGetWritingCountByFilters(req.query.id, req.query, (err, count) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Book.findBookByIdAndGetWritingsByFilters(req.query.id, req.query, (err, data) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('book/writing/index', {
          page: 'book/writing/index',
          title: `${res.__('Writings')} - ${book.title}`, 
          includes: {
            external: {
              css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'page', 'text'],
              js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
            }
          },
          book,
          writings_count: count,
          writings_search: data.search,
          writings_limit: data.limit,
          writings_page: data.page,
          writings: data.writings
        });
      });
    });
  });
};
