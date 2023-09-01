const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Event.findEventCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Event.findEventsByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('event/index', {
        page: 'event/index',
        title: res.__('Events'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        events_count: count,
        events_search: data.search,
        events_limit: data.limit,
        events_page: data.page,
        events: data.events
      });
    });
  });
};
