const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectByIdAndFormat(req.query.id, (err, project) => {
    if (err) return res.redirect('/error?message=' + err);

    return res.render('project/edit', {
      page: 'project/edit',
      title: project.name,
      includes: {
        external: {
          css: ['confirm', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['adminListeners', 'createConfirm', 'createFormPopUp', 'page', 'serverRequest']
        }
      },
      project
    });
  });
};
