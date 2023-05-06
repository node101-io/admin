const Tag = require('../../../models/tag/Tag');

module.exports = (req, res) => {
  Tag.findTagCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Tag.findTagsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('tag/index', {
        page: 'tag/index',
        title: res.__('Tags'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        tags_count: count,
        tags_search: data.search,
        tags_limit: data.limit,
        tags_page: data.page,
        tags: data.tags
      });
    });
  });
};
