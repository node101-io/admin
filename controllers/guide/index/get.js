const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Guide.findGuideCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Guide.findGuidesByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('guide/index', {
        page: 'guide/index',
        title: res.__('Guides'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
          }
        },
        guides_count: count,
        guides_search: data.search,
        guides_limit: data.limit,
        guides_page: data.page,
        guides: data.guides
      });
    });
  });
};
