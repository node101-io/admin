const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getVenue = require('./functions/getVenue');
const getProjectByLanguage = require('./functions/getProjectByLanguage');
const isVenueComplete = require('./functions/isVenueComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 227;
const IMAGE_NAME_PREFIX = 'node101 venue image ';
const IMAGE_WIDTH = 393;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const VenueSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  description: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_name: { // Shadow search fields used for search queries. Includes translated values as well as real field, seperated by a space.
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_description: { // Shadow search fields used for search queries. Includes translated values as well as real field, seperated by a space.
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  address: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  province: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  seated_capacity: {
    type: Number
  },
  standing_capacity: {
    type: Number
  },
  contact_number: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  contact_email: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  social_media_accounts: {
		type: Object,
		default: {}
	},
  translations: {
		type: Object,
		default: {}
	},
  is_completed: {
		type: Boolean,
		default: false
	},
  created_at: {
		type: Date,
		required: true
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

VenueSchema.statics.createVenue = function (data, callback) {
  const Venue = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Venue.findOne({
    name: data.name.trim()
  }, (err, venue) => {
    if (err) return callback(err);
    if (venue) return callback('duplicated_unique_field');

    Venue.findVenueCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newVenueData = {
        name: data.name.trim(),
        search_name: data.name.trim(),
        created_at: new Date(),
        order
      };

      const newVenue = new Venue(newVenueData);

      newVenue.save((err, venue) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        venue.translations = formatTranslations(venue, 'tr');
        venue.translations = formatTranslations(venue, 'ru');

        Venue.findByIdAndUpdate(venue._id, { $set: {
          translations: venue.translations
        }}, err => {
          if (err) return callback('database_error');

          Venue.collection
          .createIndex(
            { search_name: 'text', search_description: 'text' },
            { weights: {
              search_name: 10,
              search_description: 5
            }}
          )
          .then(() => callback(null, venue._id.toString()))
          .catch(_ => callback('index_error'));
        });
      });
    });
  });
};

VenueSchema.statics.findVenueById = function (id, callback) {
  const Venue = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Venue.findById(mongoose.Types.ObjectId(id.toString()), (err, venue) => {
    if (err) return callback('database_error');
    if (!venue) return callback('document_not_found');

    const is_completed = isVenueComplete(venue);

    if (venue.is_completed == is_completed)
      return callback(null, venue);

    Venue.findByIdAndUpdate(venue._id, { $set: {
      is_completed
    }}, { new: true }, (err, venue) => {
      if (err) return callback('database_error');

      return callback(null, venue);
    })
  });
};

VenueSchema.statics.findVenueByIdAndFormat = function (id, callback) {
  const Venue = this;

  Venue.findVenueById(id, (err, venue) => {
    if (err) return callback(err);

    getVenue(venue, (err, venue) => {
      if (err) return callback(err);

      return callback(null, venue);
    });
  });
};

VenueSchema.statics.findVenueByIdAndUpdateImage = function (id, file, callback) {
  const Venue = this;

  Venue.findVenueById(id, (err, venue) => {
    if (err) return callback(err);
    if (venue.is_deleted) return callback('not_authenticated_request');

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + venue.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      Venue.findByIdAndUpdate(venue._id, { $set: {
        image: url
      }}, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!venue.image || venue.image.split('/')[venue.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(venue.image, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

VenueSchema.statics.findVenueCountByFilters = function (data, callback) {
  const Venue = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {}

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Venue
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };
    Venue
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  }
};

VenueSchema.statics.findVenueByIdAndDelete = function (id, callback) {
  const Venue = this;

  Venue.findVenueById(id, (err, venue) => {
    if (err) return callback(err);
    if (venue.is_deleted) return callback(null);

    Venue.findByIdAndUpdate(venue._id, {$set: {
      name: venue.name + venue._id.toString(),
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      Venue.find({
        order: { $gt: venue.order }
      }, (err, venues) => {
        if (err) return callback('database_error');

        async.timesSeries(
          venues.length,
          (time, next) => Venue.findByIdAndUpdate(venues[time]._id, {$inc: {
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

VenueSchema.statics.findVenueByIdAndRestore = function (id, callback) {
  const Venue = this;

  Venue.findVenueById(id, (err, venue) => {
    if (err) return callback(err);
    if (!venue.is_deleted) return callback(null);
    
    Venue.findVenueCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      Venue.findByIdAndUpdate(venue._id, {
        name: venue.name.replace(venue._id.toString(), ''),
        is_deleted: false,
        order
      }, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

VenueSchema.statics.findVenueByIdAndIncOrderByOne = function (id, callback) {
  const Venue = this;

  Venue.findVenueById(id, (err, venue) => {
    if (err) return callback(err);
    if (venue.is_deleted) return callback('not_authenticated_request');

    Venue.findOne({
      order: venue.order + 1
    }, (err, prev_venue) => {
      if (err) return callback('database_error');
      if (!prev_venue)
        return callback(null);

      Venue.findByIdAndUpdate(venue._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Venue.findByIdAndUpdate(prev_venue._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Venue', VenueSchema);