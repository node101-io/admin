const Event = require('../../../models/event/Event');

module.exports = (req, res) => {
  const types = {
    'none': res.__('Other'),
    'summit': res.__('Summit'),
    'party': res.__('Party'),
    'conference': res.__('Conference'),
    'hackathon': res.__('Hackathon'),
    'meetup': res.__('Meetup'),
    'workshop': res.__('Workshop'),
    'dinner': res.__('Dinner'),
    'brunch': res.__('Brunch'),
    'co_living': res.__('Co-Living'),
    'nfts': res.__('NFTs'),
    'tour': res.__('Tour')
  }
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
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      event,
      types,
      socialAccounts
    });
  });
};
