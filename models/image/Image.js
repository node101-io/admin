const async = require('async');
const mongoose = require('mongoose');

const toURLString = require('../../utils/toURLString');

const deleteImage = require('./functions/deleteImage');
const renameImage = require('./functions/renameImage');
const uploadImage = require('./functions/uploadImage');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_IMAGE_SIZE = 1e4;
const MAX_ITEM_COUNT_PER_CRON_JOB = 1e2;
const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    trim: true
  },
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
  },
  expiration_date: {
    type: Number,
    required: true
  },
  is_used: {
    type: Boolean,
    default: false
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
          name: data.original_name,
          url,
          width: data.width,
          height: data.height,
          expiration_date: (new Date).getTime() + ONE_DAY_IN_MS,
          is_used: data.is_used ? true : false
        };

        const newImage = new Image(newImageData);

        newImage.save((err, image) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');
          
          Image.findExpiredImagesAndDelete(err => {
            if (err) console.log(err);
  
            return callback(null, url);
          });
        });
      } else {
        Image.findByIdAndUpdate(image._id, {$set: {
          width: data.width,
          height: data.height
        }}, (err, image) => {
          if (err) return callback('database_error');

          Image.findExpiredImagesAndDelete(err => {
            if (err) console.log(err);
    
            return callback(null, image.url);
          });
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

ImageSchema.statics.findExpiredImagesAndDelete = function (callback) {
  const Image = this;

  Image
    .find({
      is_used: false,
      expiration_date: { $lt: (new Date()).getTime() }
    })
    .limit(MAX_ITEM_COUNT_PER_CRON_JOB)
    .then(images => async.timesSeries(
      images.length,
      (time, next) => Image.findImageByUrlAndDelete(images[time].url, err => next(err)),
      err => {
        if (err) return callback(err);

        return callback(null);
      }
    ))
    .catch(err => {
      return callback(err);
    });
};

ImageSchema.statics.findImageByUrlAndSetAsUsed = function (url, callback) {
  const Image = this;

  Image.findImageByUrl(url, (err, image) => {
    if (err) return callback(err);

    if (image.is_used) return callback(null);

    Image.findByIdAndUpdate(mongoose.Types.ObjectId(image._id.toString()), {$set: {
      is_used: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ImageSchema.statics.findImageByUrlAndRename = function (url, data, callback) {
  const Image = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Image.findImageByUrl(url, (err, image) => {
    if (err) return callback(err);

    Image.findOne({
      url
    })
  })
}

module.exports = mongoose.model('Image', ImageSchema);
