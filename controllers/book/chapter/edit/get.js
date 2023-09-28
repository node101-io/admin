const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  const types = {
    'node101': res.__('node101'),
    'project': res.__('Project'),
    'terms': res.__('Terms')
  };

  Chapter.findChapterByIdAndFormat(req.query.id, (err, chapter) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('book/chapter/edit', {
      page: 'book/chapter/edit',
      title: chapter.name,
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'navbarListeners', 'page', 'serverRequest']
        }
      },
      chapter,
      types
    });
  });
};
