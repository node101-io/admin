const Stake = require('../../../models/stake/Stake');

module.exports = (req, res) => {
  Stake.findStakeByProjectId(req.query.project_id, (err, stake) => {
    if (err && err != 'document_not_found') return res.redirect('/error?message=' + err);

    if (!err && stake)
      Stake.findStakeByIdAndFormat(stake._id, (err, stake) => {
        if (err) return res.redirect('/error?message=' + err);
    
        return res.render('stake/edit', {
          page: 'stake/edit',
          title: `${res.__('Stake')} - ${stake.project.name}`,
          includes: {
            external: {
              css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
            }
          },
          stake
        });
      });
    else
      Stake.createStake({
        project_id: req.query.project_id
      }, (err, stake) => {
        console.log(err)
        if (err) return res.redirect('/error?message=' + err);
    
        return res.render('stake/edit', {
          page: 'stake/edit',
          title: `${res.__('Stake')} - ${stake.project.name}`,
          includes: {
            external: {
              css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
              js: ['adminListeners', 'ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
            }
          },
          stake
        });
      });
  });
};
