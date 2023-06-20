const async = require('async');
const validator = require('validator');

const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

function getChapterIdArray(chapter_id) {
  const chapter_ids = [];

  for (let i = 0; i < chapter_id.length; i++) {
    let each = '';
    while (i < chapter_id.length && chapter_id[i] != ',')
      each += chapter_id[i++];

    chapter_ids.push(each);
  }

  return chapter_ids;
};

module.exports = (req, res) => {
  Book.findBookById(req.query.book_id, (err, book) => {
    if (err) return res.redirect('/error?message=' + err);

    if (req.query.chapter_id) {
      if (typeof req.query.chapter_id != 'string')
        return res.redirect('/error?message=bad_request');

      const chapters = getChapterIdArray(req.query.chapter_id);

      if (!chapters.length || chapters.find(any => !validator.isMongoId(any.toString())))
        return res.redirect('/error?message=bad_request');

      async.timesSeries(
        chapters.length,
        (time, next) => Chapter.findChapterById(chapters[time], (err, chapter) => next(err, chapter)),
        (err, chapters) => {
          if (err)
            return res.redirect('/error?message=' + err);

          const last_chapter = chapters[chapters.length - 1];

          Chapter.findChapterByIdAndGetChildrenByFilters(last_chapter._id, req.query, (err, data) => {
            if (err) return res.redirect('/error?message=' + err);
    
            let link = `/book/chapter?book_id=${req.query.book_id}&chapter_id=`;
    
            return res.render('book/chapter/index', {
              page: 'book/chapter/index',
              title: `${res.__('Chapters')}${chapters.map(each => ' - ' + each.title)} - ${book.name}`, 
              includes: {
                external: {
                  css: ['breadcrump', 'confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
                  js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
                }
              },
              book,
              chapter: last_chapter,
              breadcrumps: [
                { name: res.__('Books'), link: '/book' },
                { name: book.name, link: '/book/chapter?book_id=' + req.query.book_id }
              ].concat(chapters.map((each, i) => {
                link += (i > 0 ? ',' : '') + each._id.toString();
                return { name: each.title, link: link }
              })),
              children_search: data.search,
              children_limit: data.limit,
              children_page: data.page,
              children: data.children
            });
          });
        }
      );
    } else {
      Book.findBookByIdAndGetChildrenByFilters(book._id, req.query, (err, data) => {
        if (err) return res.redirect('/error?message=' + err);
  
        return res.render('book/chapter/index', {
          page: 'book/chapter/index',
          title: `${res.__('Chapters')} - ${book.name}`, 
          includes: {
            external: {
              css: ['breadcrump', 'confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
            }
          },
          book,
          breadcrumps: [
            { name: res.__('Books'), link: '/book' },
            { name: book.name, link: '/book/chapter?book_id=' + req.query.book_id },
          ],
          children_search: data.search,
          children_limit: data.limit,
          children_page: data.page,
          children: data.children
        });
      });
    }
  })
}