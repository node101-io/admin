const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const toURLString = require('../../utils/toURLString');

const formatTranslations = require('./functions/formatTranslations');
const getTag = require('./functions/getTag');
const getTagByLanguage = require('./functions/getTagByLanguage');
const isTagComplete = require('./functions/isTagComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: {
    type: Array,
    required: true,
    minlength: 0,
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  identifier_languages: {
    type: Object,
    default: {}
  },
  url: {
    type: String,
    trim: true,
    default: null,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  created_at: {
    type: Date,
    required: true
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  translations: {
    type: Object,
    default: {}
  },
  order: {
    type: Number,
    required: true
  }
});

TagSchema.statics.createTag = function (data, callback) {
  const Tag = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.name);

  Tag.findOne({
    identifiers: identifier
  }, (err, tag) => {
    if (err) return callback('database_error');
    if (tag) return callback('duplicated_unique_field');

    Tag.findTagCountByFilters({}, (err, order) => {
      if (err) return callback(err);

      const newTagData = {
        name: data.name.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        order
      };
    
      const newTag = new Tag(newTagData);
    
      newTag.save((err, tag) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        tag.translations = formatTranslations(tag, 'tr');
        tag.translations = formatTranslations(tag, 'ru');

        Tag.findByIdAndUpdate(tag._id, {$set: {
          translations: tag.translations
        }}, err => {
          if (err) return callback('database_error');

          return callback(null, tag._id.toString());
        });
      });
    });
  });
};

TagSchema.statics.findTagById = function (id, callback) {
  const Tag = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Tag.findById(mongoose.Types.ObjectId(id.toString()), (err, tag) => {
    if (err) return callback('database_error');
    if (!tag) return callback('document_not_found');

    const is_completed = isTagComplete(tag);

    if (tag.is_completed == is_completed)
      return callback(null, tag);

    Tag.findByIdAndUpdate(tag._id, {$set: {
      is_completed
    }}, { new: true }, (err, tag) => {
      if (err) return callback('database_error');

      return callback(null, tag);
    });
  });
};

TagSchema.statics.findTagByIdentifierAndFormatByLanguage = function (identifier, language, callback) {
  const Tag = this;

  Tag.findOne({
    identifiers: identifier
  }, (err, tag) => {
    if (err) return callback('database_error');
    if (!tag)
      return callback('document_not_found');

    if (!tag.is_completed)
      return callback('not_authenticated_request');

    if (!language || !validator.isISO31661Alpha2(language.toString()))
      language = tag.identifier_languages[identifier];

    getTagByLanguage(tag, language, (err, tag) => {
      if (err) return callback(err);

      return callback(null, tag);
    });
  });
};

TagSchema.statics.findTagByIdAndFormat = function (id, callback) {
  const Tag = this;

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);

    getTag(tag, (err, tag) => {
      if (err) return callback(err);

      return callback(null, tag);
    });
  });
};

TagSchema.statics.findTagByIdAndFormatByLanguage = function (id, language, callback) {
  const Tag = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);

    if (!tag.is_completed)
      return callback('not_authenticated_request');

    getTagByLanguage(tag, language, (err, tag) => {
      if (err) return callback(err);

      return callback(null, tag);
    });
  });
};

TagSchema.statics.findTagByIdAndUpdate = function (id, data, callback) {
  const Tag = this;

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);
    if (tag.is_deleted) return callback('not_authenticated_request');

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.name);
    const oldIdentifier = toURLString(tag.name);

    Tag.findOne({
      _id: { $ne: tag._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = tag.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(tag.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = tag.identifier_languages[key]
      });

      Tag.findByIdAndUpdate(tag._id, {$set: {
        name: data.name.trim(),
        url: data.url && typeof data.url == 'string' && data.url.trim().length && data.url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.url.trim() : tag.url
      }}, { new: true }, (err, tag) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        tag.translations = formatTranslations(tag, 'tr', tag.translations.tr);
        tag.translations = formatTranslations(tag, 'ru', tag.translations.ru);
  
        Tag.findByIdAndUpdate(tag._id, {$set: {
          translations: tag.translations
        }}, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

TagSchema.statics.findTagByIdAndUpdateTranslations = function (id, data, callback) {
  const Tag = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);

    if (!tag.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(tag, data.language, data);
    let oldIdentifier = toURLString(tag.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    if (oldIdentifier == toURLString(tag.name))
      oldIdentifier = null;

    Tag.findOne({
      _id: { $ne: tag._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = tag.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(tag.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = tag.identifier_languages[key]
      });
  
      Tag.findByIdAndUpdate(tag._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

TagSchema.statics.findTagsByFilters = function (data, callback) {
  const Tag = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.search.trim(), $options: 'i' };

  Tag
    .find(filters)
    .sort({ order: -1 })
    .limit(limit)
    .skip(skip)
    .then(tags => async.timesSeries(
      tags.length,
      (time, next) => Tag.findTagByIdAndFormat(tags[time]._id, (err, tag) => next(err, tag)),
      (err, tags) => {
        if (err) return callback(err);

        return callback(null, {
          search: filters.name?.$regex,
          limit,
          page,
          tags
        });
      })
    )
    .catch(err => callback('database_error'));
};

TagSchema.statics.findTagCountByFilters = function (data, callback) {
  const Tag = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  Tag
    .find(filters)
    .countDocuments()
    .then(count => callback(null, count))
    .catch(err => callback('database_error'));
};

TagSchema.statics.findTagByIdAndDelete = function (id, callback) {
  const Tag = this;

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);
    if (tag.is_deleted) return callback(null);

    Tag.findByIdAndDelete(tag._id, err => {
      if (err) return callback('database_error');

      Tag.find({
        order: { $gt: tag.order }
      }, (err, tags) => {
        if (err) return callback('database_error');

        async.timesSeries(
          tags.length,
          (time, next) => Tag.findByIdAndUpdate(tags[time]._id, {$inc: {
            order: -1
          }}, err => next(err)),
          err => {
            if (err) return callback('database_error');

            return callback(null);
          }
        );
      });
    });
  });
};

TagSchema.statics.findTagByIdAndIncOrderByOne = function (id, callback) {
  const Tag = this;

  Tag.findTagById(id, (err, tag) => {
    if (err) return callback(err);
    if (tag.is_deleted) return callback('not_authenticated_request');

    Tag.findOne({
      order: tag.order + 1
    }, (err, prev_tag) => {
      if (err) return callback('database_error');
      if (!prev_tag)
        return callback(null);

      Tag.findByIdAndUpdate(tag._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Tag.findByIdAndUpdate(prev_tag._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Tag', TagSchema);
