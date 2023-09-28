const Book = require('../../../../models/book/Book');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Book.findBookByIdAndFormat(req.query.id, (err, book) => {
    if (err) return res.redirect('/error?message=' + err);

    Book.findBookByIdAndGetWritingCountByFilters(req.query.id, req.query, (err, count) => {
      if (err) return res.redirect('/error?message=' + err);
  
      Book.findBookByIdAndGetWritingsByFilters(req.query.id, req.query, (err, data) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('book/writing/delete', {
          page: 'book/writing/delete',
          title: `${res.__('Deleted Writings')} - ${book.title}`, 
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
