const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndFormat(req.query.id, (err, parent) => {
      if (err) return res.redirect('/error?message=' + err);

      Book.findBookByIdAndGetWritingCountByFilters(req.query.id, req.query, (err, count) => {
        if (err) return res.redirect('/error?message=' + err);
    
        Book.findBookByIdAndGetWritingsByFilters(req.query.id, req.query, (err, data) => {
          if (err) return res.redirect('/error?message=' + err);
    
          return res.render('book/writing/delete', {
            page: 'book/writing/delete',
            title: `${res.__('Deleted Writings')} - ${parent.title}`, 
            includes: {
              external: {
                css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'page', 'text'],
                js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
              }
            },
            parent,
            writings_count: count,
            writings_search: data.search,
            writings_limit: data.limit,
            writings_page: data.page,
            writings: data.writings
          });
        });
      });
    });
  else
    Chapter.findChapterByIdAndFormat(req.query.id, (err, parent) => {
      if (err) return res.redirect('/error?message=' + err);

      Chapter.findChapterByIdAndGetWritingCountByFilters(req.query.id, req.query, (err, count) => {
        if (err) return res.redirect('/error?message=' + err);
    
        Chapter.findChapterByIdAndGetWritingsByFilters(req.query.id, req.query, (err, data) => {
          if (err) return res.redirect('/error?message=' + err);
    
          return res.render('book/writing/delete', {
            page: 'book/writing/delete',
            title: `${res.__('Deleted Writings')} - ${parent.title}`, 
            includes: {
              external: {
                css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'page', 'text'],
                js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
              }
            },
            parent,
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
