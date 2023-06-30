const mongoose = require('mongoose');
const validator = require('validator');

module.exports = str => {
  if (!str || typeof str != 'string' || !validator.isMongoId(str.trim()))
    return '';

  return mongoose.Types.ObjectId(str.trim());
}