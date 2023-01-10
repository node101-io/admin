const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Project = require('../project/Project');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getStake = require('./functions/getStake');
const getStakeByLanguage = require('./functions/getStakeByLanguage');
const isStakeComplete = require('./functions/isStakeComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 stake ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const PROJECT_RATING_MIN_VALUE = 1;
const PROJECT_RATING_MAX_VALUE = 5;

const Schema = mongoose.Schema;

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
    default: false
  }
});

StakeSchema.statics.createStake = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectById(data.project_id, (err, project) => {
    if (err) return callback(err);

    const newStakeData = {
      projet_id: project._id,
      created_at: new Date()
    };

    const newStake = new Stake(newStakeData);

    newStake.save((err, stake) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null, stake._id.toString());
    });
  });
};

StakeSchema.statics.findStakeById = function (id, callback) {
  const Stake = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

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

StakeSchema.statics.findStakeByIdentifierAndFormatByLanguage = function (identifier, language, callback) {
  const Stake = this;

  Stake.findOne({
    identifiers: identifier
  }, (err, stake) => {
    if (err) return callback('database_error');
    if (!stake)
      return callback('document_not_found');

    if (!stake.is_completed)
      return callback('not_authenticated_request');

    if (!language || !validator.isISO31661Alpha2(language.toString()))
      language = stake.identifier_languages[identifier];

    getStakeByLanguage(stake, language, (err, stake) => {
      if (err) return callback(err);

      return callback(null, stake);
    });
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

StakeSchema.statics.findStakeByIdAndUpdateImage = function (id, file, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + stake.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Stake.findByIdAndUpdate(stake._id, { $set: {
        image: url
      }}, { new: false }, (err, stake) => {
        if (err) return callback(err);

        if (!stake.image || stake.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(stake.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdate = function (id, data, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const identifier = toURLString(data.name);

    Stake.findOne({
      identifiers: identifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate && duplicate._id.toString() != stake._id.toString())
        return callback('duplicated_unique_field');

      const identifier_languages = {
        identifier: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(stake.identifier_languages).forEach(key => {
        if (key != toURLString(stake.name))
          identifier_languages[key] = stake.identifier_languages[key]
      });

      Stake.findByIdAndUpdate(stake._id, {$set: {
        name: data.name.trim(),
        identifiers: stake.identifiers.filter(each => each != toURLString(stake.name)).concat(identifier),
        identifier_languages,
        description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : stake.description,
        rating: data.rating && data.rating >= PROJECT_RATING_MIN_VALUE && data.rating <= PROJECT_RATING_MAX_VALUE ? data.rating : stake.rating,
        social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
      }}, err => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');
  
        return callback(null);
      });
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

    const translations = formatTranslations(stake, data);
    const oldIdentifier = toURLString(stake.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    const identifier_languages = {
      newIdentifier: data.language
    };

    Object.keys(stake.identifier_languages).forEach(key => {
      if (key != oldIdentifier)
        identifier_languages[key] = stake.identifier_languages[key]
    });

    Stake.findByIdAndUpdate(stake._id, {$set: {
      identifiers: stake.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier),
      identifier_languages,
      translations
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakesByFilters = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? limit * parseInt(data.page) : 0;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Stake
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .then(stakes => async.timesSeries(
      stakes.length,
      (time, next) => Stake.findStakeByIdAndFormat(stakes[time], (err, stake) => next(err, stake))),
      (err, stakes) => {
        if (err) return callback(err);

        return callback(null, stakes);
      }
    )
    .catch(_ => callback('database_error'));
};

StakeSchema.statics.findStakeCountByFilters = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Stake
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Stake', StakeSchema);
