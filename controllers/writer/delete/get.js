const Writer = require('../../../models/writer/Writer');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Writer.findWriterCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Writer.findWritersByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('writer/delete', {
        page: 'writer/delete',
        title: res.__('Deleted Writers'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
          }
        },
        writers_count: count,
        writers_search: data.search,
        writers_limit: data.limit,
        writers_page: data.page,
        writers: data.writers
      });
    });
  });
}
