const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../data/wizard.json'), async (err, file) => {
    if (err) return res.status(500).json({ error: err });

    const local_data = JSON.parse(file);

    let github_data = {};

    const response = await fetch(`https://github.com/node101-io/node-wizard/releases/download/${local_data.version}/latest.json`).catch(err => {
      console.error('Failed to fetch latest release:', err);
    });
    github_data = await response.json();

    return res.render('wizard/edit', {
      page: 'wizard/edit',
      title: res.__('Edit Wizard App Data'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      data: github_data ? github_data : local_data
    });
  });
};