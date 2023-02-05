const Guide = require('../../../models/guide/Guide');

module.exports = (req, res) => {
  Guide.findGuideByIdAndFormat(req.query.id, (err, guide) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('guide/edit', {
      page: 'guide/edit',
      title: guide.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      guide
    });
  });
};
