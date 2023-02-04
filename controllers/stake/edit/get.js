const Stake = require('../../../models/stake/Stake');

module.exports = (req, res) => {
  Stake.findStakeByIdAndFormat(req.query.id, (err, stake) => {
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
};
