const Member = require('../../../models/member/Member');

module.exports = (req, res) => {
  const socialAccounts = {
    'instagram': 'Instagram',
    'medium': 'Medium',
    'telegram': 'Telegram',
    'github': 'Github',
    'discord': 'Discord',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'facebook': 'Facebook'
  };

  Member.findMemberByIdAndFormat(req.query.id, (err, member) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('member/edit', {
      page: 'member/edit',
      title: member.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      member,
      socialAccounts
    });
  });
};
