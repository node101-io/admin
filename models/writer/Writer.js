const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getWriter = require('./functions/getWriter');
const getWriterByLanguage = require('./functions/getWriterByLanguage');
const isWriterComplete = require('./functions/isWriterComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 60;
const IMAGE_WIDTH = 60;
const IMAGE_NAME_PREFIX = 'node101 writer ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const WriterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  created_at: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  social_media_accounts: {
    type: Object,
    default: {}
  },
  translations: {
    type: Object,
    default: {}
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
});

WriterSchema.statics.createWriter = function (data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const newWriterData = {
    name: data.name.trim(),
    created_at: new Date()
  };

  const newWriter = new Writer(newWriterData);

  newWriter.save((err, writer) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err) return callback('database_error');
    
    return callback(null, writer._id.toString());
  });
};

WriterSchema.statics.findWriterById = function (id, callback) {
  const Writer = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Writer.findById(mongoose.Types.ObjectId(id.toString()), (err, writer) => {
    if (err) return callback('database_error');
    if (!writer) return callback('document_not_found');

    if (writer.is_completed)
      return callback(null, writer);

    if (!isWriterComplete(writer))
      return callback(null, writer);

    Writer.findByIdAndUpdate(writer._id, {$set: {
      is_completed: true
    }}, { new: true }, (err, writer) => {
      if (err) return callback('database_error');

      return callback(null, writer);
    });
  });
};

WriterSchema.statics.findWriterByIdAndFormat = function (id, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    getWriter(writer, (err, writer) => {
      if (err) return callback(err);

      return callback(null, writer);
    });
  });
};

WriterSchema.statics.findWriterByIdAndFormatByLanguage = function (id, language, callback) {
  const Writer = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    if (!writer.is_completed)
      return callback('not_authenticated_request');

    getWriterByLanguage(writer, language, (err, writer) => {
      if (err) return callback(err);

      return callback(null, writer);
    });
  });
};

WriterSchema.statics.findWriterByIdAndUpdateImage = function (id, file, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + writer.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Writer.findByIdAndUpdate(writer._id, { $set: {
        image: url
      }}, { new: false }, (err, writer) => {
        if (err) return callback(err);

        if (!writer.image || writer.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(writer.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

WriterSchema.statics.findWriterByIdAndUpdate = function (id, data, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    Writer.findByIdAndUpdate(writer._id, {$set: {
      name: data.name.trim(),
      title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writer.title,
      social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
    }}, err => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

WriterSchema.statics.findWriterByIdAndUpdateTranslations = function (id, data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    if (!writer.is_completed)
      return callback('not_authenticated_request');

    Writer.findByIdAndUpdate(writer._id, {$set: {
      translations: formatTranslations(writer, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

WriterSchema.statics.findWritersByFilters = function (data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? limit * parseInt(data.page) : 0;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Writer
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .then(writers => async.timesSeries(
      writers.length,
      (time, next) => Writer.findWriterByIdAndFormat(writers[time], (err, writer) => next(err, writer))),
      (err, writers) => {
        if (err) return callback(err);

        return callback(null, writers);
      }
    )
    .catch(_ => callback('database_error'));
};

WriterSchema.statics.findWriterCountByFilters = function (data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Writer
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Writer', WriterSchema);
