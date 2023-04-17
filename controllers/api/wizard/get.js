const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  fs.readFile(path.join(__dirname, '../../../data/wizard.json'), (err, file) => {
    if (err) return res.status(500).json({ error: err });

    const data = JSON.parse(file);

    return res.status(200).json(data);
  });
};