const Writer = require('../../../models/writer/Writer');

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

  Writer.findWriterByIdAndFormat(req.query.id, (err, writer) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('writer/edit', {
      page: 'writer/edit',
      title: writer.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      writer,
      socialAccounts
    });
  });
};
