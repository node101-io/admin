const fs = require('fs');

module.exports = (file, callback) => {
  if (!file || !file.filename)
    return callback('bad_request');

  fs.unlink('./public/res/uploads/' + file.filename, err => {
    if (err) return callback('fs_unlink_error');

    return callback(null);
  });
};