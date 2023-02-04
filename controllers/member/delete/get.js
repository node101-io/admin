const Member = require('../../../models/member/Member');

module.exports = (req, res) => {
  req.query.is_deleted = true;

  Member.findMemberCountByFilters(req.query, (err, count) => {
    if (err) return res.redirect('/error?message=' + err);

    Member.findMembersByFilters(req.query, (err, data) => {
      if (err) return res.redirect('/error?message=' + err);

      return res.render('member/delete', {
        page: 'member/delete',
        title: res.__('Deleted Members'),
        includes: {
          external: {
            css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
            js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
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
}
