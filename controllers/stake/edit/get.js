const Project = require('../../../models/project/Project');

module.exports = (req, res) => {
  Project.findProjectById(req.query.project_id, (err, project) => {
    if (err) return res.redirect('/error?message=' + err);

    Project.findProjectByIdAndGetStake(req.query.project_id, (err, stake) => {
      if (err && err != 'document_not_found') return res.redirect('/error?message=' + err);
  
      if (!err && stake)
        return res.render('stake/edit', {
          page: 'stake/edit',
          title: `${res.__('Stake')} - ${project.name}`,
          includes: {
            external: {
              css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
            }
          },
          project,
          stake
        });
      else
        Project.findProjectByIdAndCreateStake(req.query.project_id, (err, stake) => {
          if (err) return res.redirect('/error?message=' + err);
      
          return res.render('stake/edit', {
            page: 'stake/edit',
            title: `${res.__('Stake')} - ${project.name}`,
            includes: {
              external: {
                css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
                js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
              }
            },
            project,
            stake
          });
        });
    });
  });
};
