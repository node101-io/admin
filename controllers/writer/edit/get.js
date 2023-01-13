const Writer = require('../../../models/writer/Writer');

module.exports = (req, res) => {
  Writer.findWriterByIdAndFormat(req.query.id, (err, writer) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('writer/edit', {
      page: 'writer/edit',
      title: writer.name,
      includes: {
        external: {
          css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
        }
      },
      writer
    });
  });
};
