const async = require('async');
const mongoose = require('mongoose');

const toURLString = require('../../utils/toURLString');

const deleteImage = require('./functions/deleteImage');
const uploadImage = require('./functions/uploadImage');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_IMAGE_SIZE = 1e4;

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: {
    type: String,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true,
    unique: true
  },
  width: {
    type: Number,
    required: true,
    min: 1,
    max: MAX_IMAGE_SIZE
  },
  height: {
    type: Number,
    required: true,
    min: 1,
    max: MAX_IMAGE_SIZE
  }
});

ImageSchema.statics.createImage = function (data, callback) {
  const Image = this;

  if (!data.file_name)
    return callback('bad_request');

  if (data.original_name && typeof data.original_name == 'string')
    data.original_name = toURLString(data.original_name);
  else
    data.original_name = data.file_name;

  if (!data.width || isNaN(parseInt(data.width)) || parseInt(data.width) <= 0 || parseInt(data.width) > MAX_IMAGE_SIZE)
    return callback('bad_request')

  if (!data.height || isNaN(parseInt(data.height)) || parseInt(data.height) <= 0 || parseInt(data.height) > MAX_IMAGE_SIZE)
    return callback('bad_request');

  data.width = parseInt(data.width);
  data.height = parseInt(data.height);

  uploadImage(data, (err, url) => {
    if (err) return callback('aws_database_error');

    Image.findImageByUrl(url, (err, image) => {
      if (err && err != 'document_not_found')
        return callback(err);

      if (err || !image) {
        const newImageData = {
          url,
          width: data.width,
          height: data.height
        };
    
        const newImage = new Image(newImageData);
    
        newImage.save((err, image) => {
          if (err)
            return callback('database_error');
          return callback(null, image.url);
        });
      } else {
        Image.findByIdAndUpdate(image._id, {$set: {
          width: data.width,
          height: data.height
        }}, (err, image) => {
          if (err)
            return callback('database_error');
          return callback(null, image.url);
        });
      };
    });
  });
};

ImageSchema.statics.findImageByUrl = function (url, callback) {
  const Image = this;

  if (!url || typeof url != 'string')
    return callback('bad_request');

  Image.findOne({
    url: url.trim()
  }, (err, image) => {
    if (err) return callback('database_error');
    if (!image) return callback('document_not_found');

    return callback(null, image);
  });
};

ImageSchema.statics.findImageByUrlAndDelete = function (url, callback) {
  const Image = this;

  Image.findImageByUrl(url, (err, image) => {
    if (err) return callback(err);

    deleteImage(image.url, err => {
      if (err) return callback('aws_database_error');
  
      Image.findByIdAndDelete(mongoose.Types.ObjectId(image._id.toString())  , err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

module.exports = mongoose.model('Image', ImageSchema);
