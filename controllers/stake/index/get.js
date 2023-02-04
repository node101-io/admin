const Stake = require('../../../models/stake/Stake');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Stake.findStakeCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Stake.findStakesByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('stake/index', {
        page: 'stake/index',
        title: res.__('Stakes'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
          }
        },
        stakes_count: count,
        stakes_search: data.search,
        stakes_limit: data.limit,
        stakes_page: data.page,
        stakes: data.stakes
      });
    });
  });
};
