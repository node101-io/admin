const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../data/wizard.json'), async (err, file) => {
    if (err) return res.status(500).json({ error: err, success: false });

    const local_data = JSON.parse(file);

    const latest_version = await fetch('https://api.github.com/repos/node101-io/klein/tags')
      .then(res => res.json())
      .then(json => json[0].name.replace('v', ''))
      .catch(console.log);

    const github_data = await fetch(`https://github.com/node101-io/klein/releases/download/v${latest_version}/latest.json`)
      .then(res => res.json())
      .catch(console.log);

    if (github_data) {
      github_data.platforms['darwin-aarch64'] = github_data.platforms['darwin-x86_64'];
      github_data.notes = '';
    }

    return res.render('wizard/edit', {
      page: 'wizard/edit',
      title: res.__('Edit Klein Data'),
      includes: {
        external: {
          css: ['confirm', 'create', 'form', 'formPopUp', 'general', 'header', 'items', 'navbar', 'navigation', 'text'],
          js: ['ancestorWithClassName', 'createConfirm', 'createFormPopUp', 'form', 'page', 'serverRequest']
        }
      },
      data: github_data || local_data,
      status: {
        is_synced: github_data,
        is_new: github_data && local_data.version !== latest_version
      }
    });
  });
};