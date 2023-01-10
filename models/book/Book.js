const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Catalogue = require('../catalogue/Catalogue');
const Image = require('../image/Image');

const getBook = require('./functions/getBook');

const COVER_HEIGHT = 180;
const COVER_WIDTH = 270;
const IMAGE_HEIGHT = 120;
const IMAGE_WIDTH = 120;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  writer_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  order: {
    type: Number,
    min: 0
  },
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  description: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  image: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  translations: {
    type: Object,
    default: {}
  }
});

BookSchema.statics.findBookById = function (id, callback) {
  const Book = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Book.findById(mongoose.Types.ObjectId(id.toString()), (err, book) => {
    if (err) return callback('database_error');
    if (!book) return callback('document_not_found');

    return callback(null, book);
  });
};

BookSchema.statics.findBookByIdAndFormat = function (id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    getBook(book, (err, book) => {
      if (err) return callback(err);

      return callback(null, book);
    });
  });
};

module.exports = mongoose.model('Book', BookSchema);
