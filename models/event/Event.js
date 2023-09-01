const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getEvent = require('./functions/getEvent');
const getEventByLanguage = require('./functions/getEventByLanguage');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const isEventComplete = require('./functions/isEventComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const LOGO_HEIGHT = 300;
const LOGO_NAME_PREFIX = 'node101 event logo ';
const LOGO_WIDTH = 300;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const EVENT_TYPES = [ 'summit', 'party', 'conference', 'hackathon', 'meetup', 'workshop', 'dinner', 'brunch', 'co_living', 'nfts', 'tour' ]

const Schema = mongoose.Schema;

const EventSchema = new Schema({
	name: {
		type: String,
		required: true,
		trim: true,
		minlength: 1,
		maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	},
  start_date: {
    type: Date,
    trim: true,
    default: null,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  end_date: {
    type: Date,
    trim: true,
    default: null,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
	description: {
		type: String,
		default: null,
		trim: true,
		maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	},
  event_type: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
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
	logo: {
		type: String,
		default: null,
		minlength: 0,
		maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	},
	created_at: {
		type: Date,
		required: true
	},
	social_media_accounts: {
		type: Object,
		default: {}
	},
	translations: {
		type: Object,
		default: {}
	},
	location: {
		type: String,
		default: null,
		trim: true,
		maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	},
	register_url: {
		type: String,
		default: null,
		trim: true,
		maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	},
	is_deleted: {
		type: Boolean,
		default: false
	},
	is_completed: {
		type: Boolean,
		default: false
	}
});

EventSchema.statics.createEvent = function (data, callback) {
  const Event = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Event.findEventCountByFilters({ is_deleted: false }, (err) => {
    if (err) return callback(err);

    const newEventData = {
      name: data.name.trim(),
			search_name: data.name.trim(),
      created_at: new Date()
    };

    const newEvent = new Event(newEventData);

    newEvent.save((err, event) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');
        
      event.translations = formatTranslations(event, 'tr');
      event.translations = formatTranslations(event, 'ru');

      Event.findByIdAndUpdate(event._id, { $set: {
        translations: event.translations
      }}, err => {
        if (err) return callback('database_error');

        Event.collection
          .createIndex(
            { search_name: 'text', search_description: 'text' },
            { weights: {
              search_name: 10,
              search_description: 1
            }}
          )
          .then(() => callback(null, event._id.toString()))
          .catch(_ => callback('index_error'));
      });
    });
  });
};

EventSchema.statics.findEventById = function (id, callback) {
  const Event = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');
  
  Event.findById(mongoose.Types.ObjectId(id.toString()), (err, event) => {
    if (err) return callback('database_error');
    if (!event) return callback('document_not_found');

    const is_completed = isEventComplete(event);

    if (event.is_completed == is_completed)
      return callback(null, event);
    
      Event.findByIdAndUpdate(event._id, {$set: {
      is_completed
    }}, { new: true }, (err, event) => {
      if (err) return callback('database_error');
      
      return callback(null, event);
    });
  });
};

EventSchema.statics.findEventByIdAndFormat = function (id, callback) {
	const Event = this;

	Event.findEventById(id, (err, event) => {
		if (err) return callback(err);

		getEvent(event, (err, event) => {
			if (err) return callback(err);

			return callback(null, event);
		});
	});
};

EventSchema.statics.findEventByIdAndFormatByLanguage = function (id, language, callback) {
  const Event = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);

    if (!event.is_completed)
      return callback('not_authenticated_request')

    getEventByLanguage(event, language, (err, event) => {
      if (err) return callback(err);

      return callback(null, event)
    });
  });
};

EventSchema.statics.findEventByIdAndUpdate = function (id, data, callback) {
	const Event = this;

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (event.is_deleted) return callback('not_authenticated_request');
    
    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    if (!data.start_date || typeof data.start_date != 'string' || isNaN(new Date(data.start_date)))
      return callback('bad_request');

    if (!data.event_type || typeof data.event_type != 'string' || !data.event_type.trim().length || data.event_type.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    Event.findByIdAndUpdate(event._id, { $set: {
      name: data.name.trim(),
      description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : event.description,
      event_type: data.event_type && typeof data.event_type == 'string' && EVENT_TYPES.includes(data.event_type) ? data.event_type : event.event_type,
      start_date: new Date(data.start_date),
      end_date: data.end_date && typeof data.end_date == 'string' && !isNaN(new Date(data.end_date)) ? new Date(data.end_date) : null,
      location: data.location && typeof data.location == 'string' && data.location.trim().length && data.location.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.location.trim() : null,
      register_url: data.register_url && typeof data.register_url == 'string' && data.register_url.trim().length && data.register_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.register_url.trim() : null,
      social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
    }}, { new: true }, (err, event) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      event.translations = formatTranslations(event, 'tr', event.translations.tr);
      event.translations = formatTranslations(event, 'ru', event.translations.ru);

      Event.findByIdAndUpdate(event._id, {$set: {
        translations: event.translations
      }}, { new: true }, (err, event) => {
        if (err) return callback('database_error');

        const searchName = new Set();
        const searchDescription = new Set();

        event.name.split(' ').forEach(word => searchName.add(word));
        event.translations.tr.name.split(' ').forEach(word => searchName.add(word));
        event.translations.ru.name.split(' ').forEach(word => searchName.add(word));
        event.description.split(' ').forEach(word => searchDescription.add(word));
        event.translations.tr.description.split(' ').forEach(word => searchDescription.add(word));
        event.translations.ru.description.split(' ').forEach(word => searchDescription.add(word));

        Event.findByIdAndUpdate(event._id, { $set: {
          search_name: Array.from(searchName).join(' '),
          search_description: Array.from(searchDescription).join(' ')
        }}, { new: true }, (err, event) => {
          if (err) return callback('database_error');

          Event.collection
            .createIndex(
              { search_name: 'text', search_description: 'text' },
              { weights: {
                search_name: 10,
                search_description: 1
              }}
            )
            .then(() => callback(null))
            .catch(_ => callback('index_error'));
        });
      });
    });
  });
};

EventSchema.statics.findEventByIdAndUpdateLogo = function (id, file, callback) {
  const Event = this;

  if (!file || !file.filename)
    return callback('bad_request');

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (event.is_deleted) return callback('not_authenticated_request');

    Image.createImage({
      file_name: file.filename,
      original_name: LOGO_NAME_PREFIX + event.name,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      Event.findByIdAndUpdate(event._id, { $set: {
        logo: url
      }}, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!event.logo || event.logo.split('/')[event.logo.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(event.logo, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

EventSchema.statics.findEventByIdAndUpdateTranslations = function (id, data, callback) {
  const Event = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    
    if (!event.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(event, data.language, data);

    Event.findByIdAndUpdate(event._id, { $set: {
      translations
    }}, { new: true }, (err, event) =>  {
      if (err) return callback('database_error');

      const searchName = new Set();
      const searchDescription = new Set();

      event.name.split(' ').forEach(word => searchName.add(word));
      event.translations.tr.name.split(' ').forEach(word => searchName.add(word));
      event.translations.ru.name.split(' ').forEach(word => searchName.add(word));
      event.description.split(' ').forEach(word => searchDescription.add(word));
      event.translations.tr.description.split(' ').forEach(word => searchDescription.add(word));
      event.translations.ru.description.split(' ').forEach(word => searchDescription.add(word));

      Event.findByIdAndUpdate(event._id, { $set: {
        search_name: Array.from(searchName).join(' '),
        search_description: Array.from(searchDescription).join(' ')
      }}, err => {
        if (err) return callback('database_error');

        Event.collection
          .createIndex(
            { search_name: 'text', search_description: 'text' },
            { weights: {
              search_name: 10,
              search_description: 1
            }}
          )
          .then(() => callback(null))
          .catch(_ => callback('index_error'));
      });
    });
  });
};

EventSchema.statics.findEventsByFilters = function (data, callback) {
  const Event = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (data.event_type && typeof data.event_type == 'string' && data.event_type.trim().length && data.event_type.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.event_type = { $regex: data.event_type.trim(), $options: 'i' };

  if (data.date_after && typeof data.date_after == 'string' && !isNaN(new Date(data.date_after)))
    filters.start_date = { $gte: new Date(data.date_after) };

  if (data.date_before && typeof data.date_before == 'string' && !isNaN(new Date(data.date_before)))
    filters.start_date = { $lte: new Date(data.date_before) };

  if (data.location && typeof data.location == 'string' && data.location.trim().length && data.location.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.location = { $regex: data.location.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Event
      .find(filters)
      .sort({
        start_date: -1,
        end_date: -1
      })
      .limit(limit)
      .skip(skip)
      .then(events => async.timesSeries(
        events.length,
        (time, next) => Event.findEventByIdAndFormat(events[time]._id, (err, event) => next(err, event)),
        (err, events) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            events
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Event
      .find(filters)
      .sort({
        start_date: -1,
        end_date: -1
      })
      .limit(limit)
      .skip(skip)
      .then(events => async.timesSeries(
        events.length,
        (time, next) => Event.findEventByIdAndFormat(events[ time ]._id, (err, event) => next(err, event)),
        (err, events) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            events
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

EventSchema.statics.findEventCountByFilters = function (data, callback) {
	const Event = this;

	if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i'};

  if (data.event_type && typeof data.event_type == 'string' && data.event_type.trim().length && data.event_type.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.event_type = { $regex: data.event_type.trim(), $options: 'i' };

  if (data.date_after && typeof data.date_after == 'string' && !isNaN(new Date(data.date_after)))
    filters.start_date = { $gte: new Date(data.date_after) };

  if (data.date_before && typeof data.date_before == 'string' && !isNaN(new Date(data.date_before)))
    filters.start_date = { $lte: new Date(data.date_before) };

  if (data.location && typeof data.location == 'string' && data.location.trim().length && data.location.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.location = { $regex: data.location.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Event
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() }

    Event
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

EventSchema.statics.findEventByIdAndDelete = function (id, callback) {
  const Event = this;

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (event.is_deleted) return callback(null);
    
    Event.findByIdAndUpdate(event._id, { $set: {
      is_deleted: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

EventSchema.statics.findEventByIdAndRestore = function (id, callback) {
  const Event = this;

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (!event.is_deleted) return callback(null);

    Event.findByIdAndUpdate(event._id, {
      is_deleted: false
    }, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

module.exports = mongoose.model('Event', EventSchema);