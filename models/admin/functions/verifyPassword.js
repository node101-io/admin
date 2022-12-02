const bcrypt = require('bcrypt');

module.exports = function (password, password_db, callback) {
  bcrypt.compare(password, password_db, (err, res) => {
    if (err || !res)
      return callback(false);

    return callback(true);
  });
};
