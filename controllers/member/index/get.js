const Member = require('../../../models/member/Member');

module.exports = (req, res) => {
  req.query.is_deleted = false;

  Member.findMemberCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Member.findMembersByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('member/index', {
        page: 'member/index',
        title: res.__('Members'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['createConfirm', 'createFormPopUp', 'navbarListeners', 'page', 'serverRequest']
          }
        },
        members_count: count,
        members_search: data.search,
        members_limit: data.limit,
        members_page: data.page,
        members: data.members
      });
    });
  });
};
