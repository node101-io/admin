const MAX_DATA_TEXT_FIELD_LENGTH = 1e4;
const MAX_PLATFORM_COUNT = 1e2;

const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  if (!req.body.version || typeof req.body.version != 'string' || !req.body.version.trim().length || req.body.version.trim().length > MAX_DATA_TEXT_FIELD_LENGTH) {
    res.write(JSON.stringify({ success: false, error: 'bad_request' }));
    return res.end();
  }

  if (!req.body.notes || typeof req.body.version != 'string' || !req.body.notes.trim().length || req.body.notes.trim().length > MAX_DATA_TEXT_FIELD_LENGTH)
    req.body.notes = '';

  if (!req.body.platforms || typeof req.body.platforms != 'object') {
    res.write(JSON.stringify({ success: false, error: 'bad_request' }));
    return res.end();
  }

  if (Object.keys(req.body.platforms).length > MAX_PLATFORM_COUNT || Object.keys(req.body.platforms).find(each =>
      each.length > MAX_DATA_TEXT_FIELD_LENGTH ||
      !req.body.platforms[each].signature || typeof req.body.platforms[each].signature != 'string' || !req.body.platforms[each].signature.trim().length || req.body.platforms[each].signature.trim().length > MAX_DATA_TEXT_FIELD_LENGTH ||
      !req.body.platforms[each].url || typeof req.body.platforms[each].url != 'string' || !req.body.platforms[each].url.trim().length || req.body.platforms[each].url.trim().length > MAX_DATA_TEXT_FIELD_LENGTH
    )
  ) {
    res.write(JSON.stringify({ success: false, error: 'bad_request' }));
    return res.end();
  }

  const data = {
    version: req.body.version.trim(),
    notes: req.body.notes.trim(),
    publish_date: (new Date()).toISOString(),
    platforms: {}
  };

  Object.keys(req.body.platforms).forEach(key => {
    data.platforms[key] = {
      signature: req.body.platforms[key].signature.trim(),
      url: req.body.platforms[key].url.trim()
    };
  });

  fs.writeFile(path.join(__dirname, '../../data/wizard.json'), JSON.stringify(data), err => {
    if (!req.body.platforms || typeof req.body.platforms != 'object') {
      res.write(JSON.stringify({ success: false, error: 'fs_read_file_error' }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};