const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getWriter = require('./functions/getWriter');
const getWriterByLanguage = require('./functions/getWriterByLanguage');
const isWriterComplete = require('./functions/isWriterComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 300;
const IMAGE_NAME_PREFIX = 'node101 writer ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const WriterSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  link: {
    type: String,
    required: true,
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
  },
  order: {
    type: Number,
    required: true
  }
});

WriterSchema.statics.createWriter = function (data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Writer.findWriterCountByFilters({ is_deleted: false }, (err, order) => {
    if (err) return callback(err);

    const newWriterData = {
      name: data.name.trim(),
      link: toURLString(data.name),
      created_at: new Date(),
      order
    };
  
    const newWriter = new Writer(newWriterData);
  
    newWriter.save((err, writer) => {
      if (err) return callback('bad_request');

      writer.translations = formatTranslations(writer, 'tr');
      writer.translations = formatTranslations(writer, 'ru');

      Writer.findByIdAndUpdate(writer._id, {$set: {
        translations: writer.translations
      }}, err => {
        if (err && err.code == 'DUPLICATED_UNIQUE_FIELD_ERROR_CODE')
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        return callback(null, writer._id.toString());
      });
    });
  });
};

WriterSchema.statics.findWriterById = function (id, callback) {
  const Writer = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Writer.findById(mongoose.Types.ObjectId(id.toString()), (err, writer) => {
    if (err) return callback('database_error');
    if (!writer) return callback('document_not_found');

    const is_completed = isWriterComplete(writer);

    if (writer.is_completed == is_completed)
      return callback(null, writer);

    Writer.findByIdAndUpdate(writer._id, {$set: {
      is_completed: is_completed
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

WriterSchema.statics.findWriterByIdAndUpdate = function (id, data, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    Writer.findByIdAndUpdate(writer._id, {$set: {
      name: data.name.trim(),
      link: toURLString(data.name),
      title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writer.title,
      social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
    }}, err => {
      if (err && err.code == 'DUPLICATED_UNIQUE_FIELD_ERROR_CODE')
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null);
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
      }}, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!writer.image || writer.image.split('/')[writer.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(writer.image, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
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
      translations: formatTranslations(writer, data.language, data)
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
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;
  let search = null;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
    search = data.search.trim();
    filters.name = { $regex: search, $options: 'i' };
  };

  Writer
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ order: -1 })
    .then(writers => async.timesSeries(
      writers.length,
      (time, next) => Writer.findWriterByIdAndFormat(writers[time]._id, (err, writer) => next(err, writer)),
      (err, writers) => {
        if (err) return callback(err);

        return callback(null, {
          search,
          limit,
          page,
          writers
        });
      })
    )
    .catch(_ => callback('database_error'));
};

WriterSchema.statics.findWriterCountByFilters = function (data, callback) {
  const Writer = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.search.trim(), $options: 'i' };

  Writer
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

WriterSchema.statics.findWriterByIdAndDelete = function (id, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);
    if (writer.is_deleted) return callback(null);

    Writer.findByIdAndUpdate(writer._id, { $set: {
      link: writer.link + writer._id.toString(),
      is_deleted: true,
      order: null
    } }, err => {
      if (err) return callback('database_error');

      Writer.find({
        order: { $gt: writer.order }
      }, (err, writers) => {
        if (err) return callback('database_error');

        async.timesSeries(
          writers.length,
          (time, next) => Writer.findByIdAndUpdate(writers[time]._id, {$inc: {
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

WriterSchema.statics.findWriterByIdAndRestore = function (id, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);
    if (!writer.is_deleted) return callback(null);

    Writer.findWriterCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      Writer.findByIdAndUpdate(writer._id, {
        link: writer.link.replace(writer._id.toString(), ''),
        is_deleted: false,
        order
      }, err => {
        if (err) return callback('database_error');

        return callback(null);
      });
    });
  });
};

WriterSchema.statics.findWriterByIdAndIncOrderByOne = function (id, callback) {
  const Writer = this;

  Writer.findWriterById(id, (err, writer) => {
    if (err) return callback(err);
    if (writer.is_deleted) return callback('not_authenticated_request');

    Writer.findOne({
      order: writer.order + 1
    }, (err, prev_writer) => {
      if (err) return callback('database_error');
      if (!prev_writer) return callback(null);

      Writer.findByIdAndUpdate(writer._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Writer.findByIdAndUpdate(prev_writer._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Writer', WriterSchema);
