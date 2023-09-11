const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Venue.findVenueCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Venue.findVenuesByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('venue/index', {
        page: 'venue/index',
        title: res.__('Venues'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        venues_count: count,
        venues_search: data.search,
        venues_limit: data.limit,
        venues_page: data.page,
        venues: data.venues
      });
    });
  });
};
