const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');
const Project = require('../project/Project');

const formatTranslations = require('./functions/formatTranslations');
const getWriting = require('./functions/getWriting');
const getWritingByLanguage = require('./functions/getWritingByLanguage');
const isWritingComplete = require('./functions/isWritingComplete');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 500;
const IMAGE_NAME_PREFIX = 'node101 writing cover ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const WritingSchema = new Schema({
  unique_keys: { // parent_id + '-' + identifier
    type: Array,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifier: {
    type: String,
    required: true,
    trim: true
  },
  parent_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  created_at: {
    type: Date,
    required: true
  },
  apr: {
    type: Number,
    default: null
  },
  cover: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
});

WritingSchema.statics.createWriting = function (data, callback) {
  const Writing = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectById(data.project_id, (err, project) => {
    if (err) return callback(err);

    const newWritingData = {
      projet_id: project._id,
      created_at: new Date()
    };

    const newWriting = new Writing(newWritingData);

    newWriting.save((err, writing) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null, writing._id.toString());
    });
  });
};

WritingSchema.statics.findWritingById = function (id, callback) {
  const Writing = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Writing.findById(mongoose.Types.ObjectId(id.toString()), (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');

    if (writing.is_completed == isWritingComplete(writing))
      return callback(null, writing);

    Writing.findByIdAndUpdate(writing._id, {$set: {
      is_completed: isWritingComplete(writing)
    }}, { new: true }, (err, writing) => {
      if (err) return callback('database_error');

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByProjectId = function (project_id, callback) {
  const Writing = this;

  if (!project_id || !validator.isMongoId(project_id.toString()))
    return callback('bad_request');

  Writing.findOne({
    project_id: mongoose.Types.ObjectId(project_id.toString())
  }, (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');

    return callback(null, writing);
  });
};

WritingSchema.statics.findWritingByIdAndFormat = function (id, callback) {
  const Writing = this;

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    getWriting(writing, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndFormatByLanguage = function (id, language, callback) {
  const Writing = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    if (!writing.is_completed)
      return callback('not_authenticated_request');

    getWritingByLanguage(writing, language, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndUpdateImage = function (id, file, callback) {
  const Writing = this;

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + writing.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Writing.findByIdAndUpdate(writing._id, { $set: {
        image: url
      }}, { new: false }, (err, writing) => {
        if (err) return callback(err);

        if (!writing.image || writing.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(writing.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndUpdate = function (id, data, callback) {
  const Writing = this;

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    Writing.findByIdAndUpdate(writing._id, {$set: {
      apr: data.apr && !isNaN(parseFloat(data.apr)) ? parseFloat(data.apr) : null,
      writing_url: data.writing_url && typeof data.writing_url == 'string' && data.writing_url.trim().length && data.writing_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.writing_url.trim() : null,
      how_to_writing_url: data.how_to_writing_url && typeof data.how_to_writing_url == 'string' && data.how_to_writing_url.trim().length && data.how_to_writing_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.how_to_writing_url.trim() : null,
      not_yet_stakable: data.not_yet_stakable ? true : false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

WritingSchema.statics.findWritingByIdAndUpdateTranslations = function (id, data, callback) {
  const Writing = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    if (!writing.is_completed)
      return callback('not_authenticated_request');

    Writing.findByIdAndUpdate(writing._id, {$set: {
      translations: formatTranslations(writing, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Writing', WritingSchema);
