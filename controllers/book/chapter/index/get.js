const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  Book.findBookById(req.query.id, (err, book) => {
    if (err) return res.redirect('/error?message=' + err);

    Chapter.findChaptersByFilters({
      book_id: book._id,
      is_root: true
    }, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('book/chapter/index', {
        page: 'book/chapter/index',
        title: `${res.__('Chapters')} - ${book.name}`, 
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        book,
        chapters_search: data.search,
        chapters_limit: data.limit,
        chapters_page: data.page,
        chapters: data.chapters
      });
    })
  })
}