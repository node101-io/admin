const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../data/wizard.json'), (err, file) => {
    if (err) return res.status(500).json({ error: err });

    const data = JSON.parse(file);

    return res.render('wizard/edit', {
      page: 'wizard/edit',
      title: res.__('Edit Wizard App Data'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      data
    });
  });
};