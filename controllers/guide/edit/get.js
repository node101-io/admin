const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  const socialAccounts = {
    'medium': 'Medium',
    'youtube': 'Youtube',
    'spotify': 'Spotify'
  };

  const systemRequirements = {
    'cpu': 'CPU',
    'ram': 'RAM',
    'storage': 'Storage',
    'os': 'Operating System'
  };

  Guide.findGuideByIdAndFormat(req.query.id, (err, guide) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('guide/edit', {
      page: 'guide/edit',
      title: guide.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'navbarListeners', 'serverRequest']
        }
      },
      guide,
      socialAccounts,
      systemRequirements
    });
  });
};
