const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getStake = require('./functions/getStake');
const getStakeByLanguage = require('./functions/getStakeByLanguage');
const isStakeComplete = require('./functions/isStakeComplete');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 stake ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;

const Schema = mongoose.Schema;

// Currently Stakable -> Coming Soon 
// PRICE - from URL
// APR - API URL

const StakeSchema = new Schema({
  project_id: {
    type: mongoose.Types.ObjectId,
    unique: true,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  search_name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_description: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  apr: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  stake_url: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  how_to_stake_url: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  not_yet_stakable: {
    type: Boolean,
    default: false
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  translations: {
    type: Object,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    required: true
  }
});

StakeSchema.statics.createStake = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.project_id || !mongoose.Types.ObjectId(data.project_id.toString()))
    return callback('bad_request');

  Stake
    .find()
    .countDocuments()
    .then(() => {
      const newStakeData = {
        project_id: data.project_id,
        search_name: data.search_name,
        search_description: data.search_description,
        order: data.order,
        created_at: new Date()
      };
  
      const newStake = new Stake(newStakeData);
  
      newStake.save((err, stake) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        stake.translations = formatTranslations(stake, 'tr');
        stake.translations = formatTranslations(stake, 'ru');

        Stake.findByIdAndUpdate(stake._id, {$set: {
          translations: stake.translations
        }}, err => {
          if (err) return callback('database_error');

          Stake.collection
            .createIndex(
              { search_name: 'text', search_description: 'text' },
              { weights: {
                search_name: 10,
                search_description: 1
              } }
            )
            .then(() => callback(null, stake._id.toString()))
            .catch(_ => callback('index_error'));
        });
      });
    })
    .catch(_ => callback('database_error'));
};

StakeSchema.statics.findStakeById = function (id, callback) {
  const Stake = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('e');

  Stake.findById(mongoose.Types.ObjectId(id.toString()), (err, stake) => {
    if (err) return callback('database_error');
    if (!stake) return callback('document_not_found');

    if (stake.is_completed == isStakeComplete(stake))
      return callback(null, stake);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      is_completed: isStakeComplete(stake)
    }}, { new: true }, (err, stake) => {
      if (err) return callback('database_error');

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByProjectId = function (project_id, callback) {
  const Stake = this;

  if (!project_id || !validator.isMongoId(project_id.toString()))
    return callback('bad_request');

  Stake.findOne({
    project_id: mongoose.Types.ObjectId(project_id.toString())
  }, (err, stake) => {
    if (err) return callback('database_error');
    if (!stake) return callback('document_not_found');

    return callback(null, stake);
  });
};

StakeSchema.statics.findStakeByIdAndFormat = function (id, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    getStake(stake, (err, stake) => {
      if (err) return callback(err);

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByIdAndFormatByLanguage = function (id, language, callback) {
  const Stake = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    if (!stake.is_completed)
      return callback('not_authenticated_request');

    getStakeByLanguage(stake, language, (err, stake) => {
      if (err) return callback(err);

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdate = function (id, data, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      search_name: data.search_name && typeof data.search_name == 'string' && data.search_name.trim().length && data.search_name.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.search_name.trim() : null,
      search_description: data.search_description && typeof data.search_description == 'string' && data.search_description.trim().length && data.search_description.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.search_description.trim() : null,
      apr: data.apr && !isNaN(parseFloat(data.apr)) ? parseFloat(data.apr) : null,
      stake_url: data.stake_url && typeof data.stake_url == 'string' && data.stake_url.trim().length && data.stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.stake_url.trim() : null,
      how_to_stake_url: data.how_to_stake_url && typeof data.how_to_stake_url == 'string' && data.how_to_stake_url.trim().length && data.how_to_stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.how_to_stake_url.trim() : null,
      not_yet_stakable: data.not_yet_stakable ? true : false
    }}, err => {
      if (err) return callback('database_error');

      Stake.collection
        .createIndex(
          { search_name: 'text', search_description: 'text' },
          { weights: {
            search_name: 10,
            search_description: 1
          } }
        )
        .then(() => callback(null))
        .catch(_ => callback('index_error'));
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdateTranslations = function (id, data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    if (!stake.is_completed)
      return callback('not_authenticated_request');

    Stake.findByIdAndUpdate(stake._id, {$set: {
      translations: formatTranslations(stake, data.language, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdateImage = function (id, file, name, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Stake.findByIdAndUpdate(stake._id, { $set: {
        image: url
      }}, { new: false }, (err, stake) => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!stake.image || stake.image.split('/')[stake.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);
  
          Image.findImageByUrlAndDelete(stake.image, err => {
            if (err) return callback(err);
  
            return callback(null, url);
          });
        });
      });
    });
  });
};

StakeSchema.statics.findStakeByIdAndRevertIsActive = function (id, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      is_active: !stake.is_active
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakeByIdAndSetOrder = function (id, order, callback) {
  const Stake = this;

  if (!order || !Number.isInteger(order))
    return callback('bad_request');

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      order
    }}, err => callback(err));
  });
};

module.exports = mongoose.model('Stake', StakeSchema);
