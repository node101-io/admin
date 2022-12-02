const bcrypt = require('bcrypt');

module.exports = function(next) {
  const user = this;

  if (user.isModified('password')) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) return next();

      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next();

        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
};
