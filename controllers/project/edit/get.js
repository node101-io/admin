const Project = require('../../../models/project/Project');

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

  Project.findProjectByIdAndFormat(req.query.id, (err, project) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('project/edit', {
      page: 'project/edit',
      title: project.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      project,
      socialAccounts
    });
  });
};
