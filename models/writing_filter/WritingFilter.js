// IMPORTANT NOTES!
// This is a smaller WritingFilter model copy with only the required fields to filter WritingFilters faster on library.node101
// If a WritingFilter is { is_completed: false }, { is_deleted: true }, or { is_hidden: true } the WritingFilterFilter associated with it will be deleted automatically
// As this model is called only by WritingFilter model, no type check is made during the create / update functions

const mongoose = require('mongoose');
const validator = require('validator');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;

const Schema = mongoose.Schema;

const WritingFilterSchema = new Schema({
  writing_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  type: {
    type: String,
    required: true
  },
  parent_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  writer_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  created_at: {
    type: Date,
    required: true
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  label: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  flag: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  order: {
    type: Number,
    required: true
  }
});

WritingFilterSchema.statics.createWritingFilter = function (data, callback) {
  const WritingFilter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const newWritingFilterData = {
    writing_id: data.writing_id,
    title: data.title,
    type: data.type,
    parent_id: data.parent_id,
    writer_id: data.writer_id,
    created_at: data.created_at,
    subtitle: data.subtitle,
    label: data.label,
    flag: data.flag,
    order: data.order
  };

  const newWritingFilter = new WritingFilter(newWritingFilterData);

  newWritingFilter.save((err, writing_filter) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err)
      return callback('database_error');

    return callback(null, writing_filter._id);
  })
};

WritingFilterSchema.statics.findWritingFilterById = function (id, callback) {
  const WritingFilter = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  WritingFilter.findById(mongoose.Types.ObjectId(id.toString()), (err, writing_filter) => {
    if (err) return callback('database_error');
    if (!writing_filter) return callback('document_not_found');

    return callback(null, writing_filter);
  });
};

WritingFilterSchema.statics.findWritingFilterByWritingId = function (writing_id, callback) {
  const WritingFilter = this;

  if (!writing_id || !validator.isMongoId(writing_id.toString()))
    return callback('bad_request');

  WritingFilter.findOne({
    writing_id: mongoose.Types.ObjectId(writing_id.toString())
  }, (err, writing_filter) => {
    if (err) return callback('database_error');
    if (!writing_filter) return callback('document_not_found');

    return callback(null, writing_filter);
  });
};

WritingFilterSchema.statics.findWritingFilterByIdAndUpdate = function (id, data, callback) {
  const WritingFilter = this;

  WritingFilter.findWritingFilterById(id, (err, writing_filter) => {
    if (err) return callback(err);

    WritingFilter.findByIdAndUpdate(writing_filter._id, {$set: {
      title: data.title && typeof data.title == 'string' && data.title.trim().length ? data.title.trim() : writing_filter.title,
      type: data.type && typeof data.type == 'string' && data.type.trim().length ? data.type.trim() : writing_filter.type,
      parent_id: data.parent_id ? data.parent_id : writing_filter.parent_id,
      writer_id: data.writer_id ? data.writer_id : writing_filter.writer_id,
      created_at: data.created_at ? data.created_at : writing_filter.created_at,
      subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length ? data.subtitle.trim() : writing_filter.subtitle,
      label: data.label && typeof data.label == 'string' && data.label.trim().length ? data.label.trim() : writing_filter.label,
      flag: data.flag && typeof data.flag == 'string' && data.flag.trim().length ? data.flag.trim() : writing_filter.flag,
      order: data.order ? data.order : writing_filter.order
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

WritingFilterSchema.statics.findWritingFilterByIdAndDelete = function (id, callback) {
  const WritingFilter = this;

  WritingFilter.findWritingFilterById(id, (err, writing_filter) => {
    if (err) return callback(err);

    WritingFilter.findByIdAndDelete(writing_filter._id, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('WritingFilter', WritingFilterSchema);
