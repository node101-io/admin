const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getEvent = require('./functions/getEvent');
const getEventByLanguage = require('./functions/getEventByLanguage');
const getIdentifier = require('./functions/getIdentifier');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const isEventComplete = require('./functions/isEventComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const LOGO_HEIGHT = 300;
const LOGO_NAME_PREFIX = 'node101 event logo ';
const LOGO_WIDTH = 300;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

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
	// date: {
	// 	type: Date,
	// 	required: true,
	// 	trim: true,
	// 	maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
	// },
	description: {
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
	identifiers: { // toURLString(name) - toURLString(formatDate(date, 'DD-MM-YYYY))
		type: Array,
		required: true,
		default: [],
		maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
	},
	identifier_languages: {
		type: Object,
		default: {}
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
	},
  order: {
    type: Number,
    required: true
  }
});

EventSchema.statics.createEvent = function (data, callback) {
  const Event = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');
  
  // if (!data.start_date || typeof data.start_date != 'string' || isNaN(new Date(data.start_date)))
  //   return callback('bad_request');

  // if (!data.end_date || typeof data.end_date != 'string' || isNaN(new Date(data.end_date)))
  //   return callback('bad_request');
  
  const identifier = getIdentifier(data);

  Event.findOne({
    identifiers: identifier
  }, (err, event) => {
    if (err) return callback('database_error');
    if (event) return callback('duplicated_unique_field');

    Event.findEventCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newEventData = {
        name: data.name.trim(),
        // start_date: new Date(data.start_date),
        // end_date: new Date(data.end_date),
				search_name: data.name.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        order 
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

    if (!data.date || typeof data.date != 'string' || isNaN(new Date(data.date)))
      return callback('bad_request');
    
    const newIdentifier = getIdentifier(data.name, data.date, DEFAULT_IDENTIFIER_LANGUAGE);
    const oldIdentifier = getIdentifier(event.name, event.date, DEFAULT_IDENTIFIER_LANGUAGE);

    Event.findOne({
      _id: { $ne: event._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = event.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(event.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = event.identifier_languages[key];
      });

      Event.findByIdAndUpdate(event._id, { $set: {
        name: data.name.trim(),
        date: new Date(data.date),
        identifiers,
        identifier_languages,
        description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : event.decription,
        register_url: data.register_url,
        social_media_accounts: getSocialMediaAccounts(data.social_media_accounts),
        location: data.location
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

  if (!data.date && typeof data.date != 'string' && isNaN(new Date(data.date)))
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    
    if (!event.is_completed)
      return callback('not_authenticated_request');
    // const language = data.language ?? DEFAULT_IDENTIFIER_LANGUAGE; can be used here. It's all about your feedback
    const translations = formatTranslations(event, data.language, data);
    let oldIdentifier = getIdentifier(event.translations[(data.language != null && data.language != undefined) ? data.language : DEFAULT_IDENTIFIER_LANGUAGE]?.name, event.date, (data.language != null && data.language != undefined) ? data.language : DEFAULT_IDENTIFIER_LANGUAGE);
    const newIdentifier = getIdentifier(translations[data.language].name, data.date, data.language);

    const defaultIdentifier = getIdentifier(event.name, event.date, DEFAULT_IDENTIFIER_LANGUAGE);
  
    if (oldIdentifier == defaultIdentifier)
      oldIdentifier = null;
  
    Event.findOne({
      _id: { $ne: event._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = event.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };

      Object.keys(event.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = event.identifier_languages[key]
      });

      Event.findByIdAndUpdate(event._id, { $set: {
        identifiers,
        identifier_languages,
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

  if (data.date_after && typeof data.date_after == 'string' && !isNaN(new Date(data.date_after)))
    filters.date = { $gte: new Date(data.date_after) };

  if (data.date_before && typeof data.date_before == 'string' && !isNaN(new Date(data.date_before)))
    filters.date = { $lte: new Date(data.date_before) };

  if (data.location && typeof data.location == 'string' && data.location.trim().length && data.location.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.location = { $regex: data.location.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Event
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(events => async.timesSeries(
        events.length,
        (time, next) => Event.findEventByIdAndFormat(events[ time ]._id, (err, event) => next(err, event)),
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
        score: { $meta: 'textScore' },
        order: -1
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

  if (data.date_after && typeof data.date_after == 'string' && !isNaN(new Date(data.date_after)))
    filters.date = { $gte: new Date(data.date_after) };

  if (data.date_before && typeof data.date_before == 'string' && !isNaN(new Date(data.date_before)))
    filters.date = { $lte: new Date(data.date_before) };

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
      name: event.name + event._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');
      
      Event.find({
        order: { $gt: event.order }
      }, (err, events) => {
        if (err) return callback('database_error');

        async.timesSeries(
          events.length,
          (time, next) => Event.findByIdAndUpdate(events[time]._id, { $inc: {
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

EventSchema.statics.findEventByIdAndRestore = function (id, callback) {
  const Event = this;

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (!event.is_deleted) return callback(null);

    identifiers = [ toURLString(event.name.replace(event._id.toString(), '')) ];
    const identifierLanguages = {
      identifiers: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.keys(event.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.name);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(event.translations)[index];
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Event.findOne({ identifiers: identifiers[time] }, (err, event) => {
        if (err) return next('database_error');
        if (event) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Event.findEventCountByFilters({ is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Event.findByIdAndUpdate(event._id, {
            name: event.name.replace(event._id.toString(), ''),
            identifiers,
            identifier_languages: identifierLanguages,
            is_deleted: false,
            order
          }, err => {
            if (err) return callback('database_error');

            return callback(null);
          })
        })
      }
    )
  })
};

EventSchema.statics.findEventByIdAndIncOrderByOne = function (id, callback) {
  const Event = this;

  Event.findEventById(id, (err, event) => {
    if (err) return callback(err);
    if (event.is_deleted) return callback('not_authenticated_request');

    Event.findOne({
      order: event.order + 1
    }, (err, prev_event) => {
      if (err) return callback('database_error');
      if (!prev_event)
        return callback(null);

      Event.findByIdAndUpdate(event._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Event.findByIdAndUpdate(prev_event._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Event', EventSchema);