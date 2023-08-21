const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  const socialAccounts = {
    'instagram': 'Instagram',
    'medium': 'Medium',
    'telegram': 'Telegram',
    'github': 'Github',
    'discord': 'Discord',
    'twitter': 'Twitter',
    'linkedin': 'LinkedIn',
    'youtube': 'Youtube',
    'spotify': 'Spotify',
    'web': 'Website',
    'gitbook': 'Gitbook',
    'facebook': 'Facebook'
  };

  Event.findEventByIdAndFormat(req.query.id, (err, event) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('event/edit', {
      page: 'event/edit',
      title: event.name,
    //   includes: {
    //     external: {
    //       css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
    //       js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
    //     }
    //   },
      event,
      socialAccounts
    });
  });
};
