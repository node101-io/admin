const Venue = require('../../../models/venue/Venue');

module.exports = (req, res) => {
  const districts = {
    'fatih': 'Historical Peninsula (Fatih)',
    'beyoglu': 'Historical European District (Beyoğlu)',
    'halic': 'Golden Horn (Haliç)',
    'sisli': 'Şişli',
    'besiktas': 'Beşiktaş',
    'sariyer': 'Sarıyer',
    'kadikoy': 'Kadıköy',
    'uskudar': 'Üsküdar',
    'beykoz': 'Beykoz',
    'adalar': 'Adalar'
  };
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

  Venue.findVenueByIdAndFormat(req.query.id, (err, venue) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('venue/edit', {
      page: 'venue/edit',
      title: venue.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      venue,
      districts,
      socialAccounts
    });
  });
};
