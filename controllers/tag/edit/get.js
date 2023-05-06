const Tag = require('../../../models/tag/Tag');

module.exports = (req, res) => {
  Tag.findTagByIdAndFormat(req.query.id, (err, tag) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('tag/edit', {
      page: 'tag/edit',
      title: tag.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      tag
    });
  });
};
