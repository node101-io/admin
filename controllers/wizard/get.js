const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../data/wizard.json'), async (err, file) => {
    if (err) return res.status(500).json({ error: err, success: false });

    const local_data = JSON.parse(file);
    let github_data = null;
    let latest_version = null;

    try {
      const response = await fetch('https://api.github.com/repos/node101-io/node-wizard/tags');
      const tags = await response.json();
      latest_version = tags[0].name;

      const latestJsonResponse = await fetch(`https://github.com/node101-io/node-wizard/releases/download/${latest_version}/latest.json`);
      github_data = await latestJsonResponse.json();
    } catch (err) {
      github_data = null;
    }

    return res.render('wizard/edit', {
      page: 'wizard/edit',
      title: res.__('Edit Wizard App Data'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      data: github_data || local_data,
      status: {
        is_synced: !!github_data,
        is_new: !!github_data && local_data.version !== latest_version
      }
    });
  });
};