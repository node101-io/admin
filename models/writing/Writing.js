const async = require('async');
const html2json = require('html2json').html2json;
const json2html = require('html2json').json2html;
const mongoose = require('mongoose');
const validator = require('validator');

const generateRandomHEX = require('../../utils/generateRandomHEX');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Writer = require('../writer/Writer');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getWriting = require('./functions/getWriting');
const getWritingByLanguage = require('./functions/getWritingByLanguage');
const isWritingComplete = require('./functions/isWritingComplete');

const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const COVER_HEIGHT = 414;
const COVER_WIDTH = 752;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 500;
const DEFAULT_IMAGE_RANDOM_NAME_LENGTH = 32;
const IMAGE_NAME_PREFIX = 'node101 writing cover ';
const IMAGE_IDENTIFIER_CLASS_NAME = 'general-writing-image';
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const TYPE_VALUES = ['blog', 'book', 'guide'];

const Schema = mongoose.Schema;

const WritingSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: {
    type: Array,
    default: []
  },
  identifier_languages: {
    type: Object,
    default: {}
  },
  type: {
    type: String,
    required: true
  },
  parent_id: { // ID of a type from TYPE_VALUES
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
  writer_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  subtitle: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  cover: {
    type: String,
    default: null,
    minlength: 0,
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
  content: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  translations: {
    type: Object,
    default: {}
  },
  search_title: {
    type: String,
    required: true,
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_subtitle: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  order: {
    type: Number,
    required: true
  },
  is_deleted: {
    type: Boolean,
    default: false
  }
});

WritingSchema.statics.createWritingByParentId = function (_parent_id, data, callback) {
  const Writing = this;

  if (!_parent_id || !validator.isMongoId(_parent_id.toString()))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.type || !TYPE_VALUES.includes(data.type))
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.title);
  const parent_id = mongoose.Types.ObjectId(_parent_id.toString());

  Writing.findOne({
    parent_id,
    identifiers: identifier
  }, (err, writing) => {
    if (err) return callback('database_error');
    if (writing) return callback('duplicated_unique_field');

    Writer.findWriterById(data.writer_id, (err, writer) => {
      console.log(err);
      if (err) return callback(err);

      Writing.findWritingCountByParentIdAndFilters(parent_id, { is_deleted: false }, (err, order) => {
        if (err) return callback(err);
  
        const newWritingData = {
          title: data.title.trim(),
          search_title: data.title.trim(),
          identifiers: [ identifier ],
          identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
          type: data.type,
          parent_id,
          writer_id: writer._id,
          created_at: new Date(),
          order
        };
    
        const newWriting = new Writing(newWritingData);
    
        newWriting.save((err, writing) => {
          console.log(err);
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');
  
          writing.translations = formatTranslations(writing, 'tr');
          writing.translations = formatTranslations(writing, 'ru');
  
          Writing.findByIdAndUpdate(writing._id, {$set: {
            translations: writing.translations
          }}, err => {
            if (err) return callback('database_error');
  
            Writing.collection
              .createIndex(
                { search_title: 'text', search_subtitle: 'text' },
                { weights: {
                  search_title: 10,
                  search_subtitle: 1
                } }
              )
              .then(() => callback(null, writing._id.toString()))
              .catch(_ => callback('index_error'));
          });
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentId = function (id, parent_id, callback) {
  const Writing = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  if (!id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  Writing.findById(mongoose.Types.ObjectId(id.toString()), (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');
    if (writing.parent_id.toString() != parent_id.toString())
      return callback('not_authenticated_request');

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

WritingSchema.statics.findWritingByIdentifierAndFormatByLanguage = function (identifier, language, callback) {
  const Writing = this;

  if (!id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  Writing.findOne({
    identifiers: identifier
  }, (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');

    if (!writing.is_completed)
      return callback('not_authenticated_request');

    if (!language || !validator.isISO31661Alpha2(language.toString()))
      language = writing.identifier_languages[identifier];

    getWritingByLanguage(writing, language, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndFormat = function (id, parent_id, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    getWriting(writing, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndFormatByLanguage = function (id, parent_id, language, callback) {
  const Writing = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    if (!writing.is_completed)
      return callback('not_authenticated_request');

    getWritingByLanguage(writing, language, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndAndParentIdUpdateCover = function (id, parent_id, file, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + writing.title,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Writing.findByIdAndUpdate(writing._id, { $set: {
        cover: url
      }}, { new: false }, (err, writing) => {
        if (err) return callback(err);

        if (!writing.cover || writing.cover.split('/')[writing.cover.split('/').length-1] == url.split('/')[url.split('/').length-1])
          return callback(null, url);

        Image.findImageByUrlAndDelete(writing.cover, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndUpdate = function (id, parent_id, data, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);
    if (writing.is_deleted) return callback('not_authenticated_request');

    const oldContent = writing.content.concat(writing.translations.tr.content).concat(writing.translations.ru.content);

     if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.title);
    const oldIdentifier = toURLString(writing.title);

    Writing.findOne({
      _id: { $ne: writing._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = writing.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        identifier: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(writing.identifier_languages).forEach(key => {
        if (key != toURLString(writing.title))
          identifier_languages[key] = writing.identifier_languages[key]
      });

      Writer.findWriterByIdAndFormat(data.writer_id, (writer_err, writer) => {
        Writing.findByIdAndUpdate(writing._id, {$set: {
          title: data.title.trim(),
          identifiers,
          identifier_languages,
          created_at: data.created_at && !isNaN(new Date(data.created_at)) ? new Date(data.created_at) : writing.created_at,
          writer_id: !writer_err && writer ? writer._id : writing.writer_id,
          subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : writing.subtitle,
          social_media_accounts: getSocialMediaAccounts(data.social_media_accounts),
          content: data.content && Array.isArray(data.content) && data.content.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.content : writing.content
        }}, { new: true }, (err, writing) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');
    
          writing.translations = formatTranslations(writing, 'tr', writing.translations.tr);
          writing.translations = formatTranslations(writing, 'ru', writing.translations.ru);

          Writing.findByIdAndUpdate(writing._id, {$set: {
            translations: writing.translations
          }}, { new: true }, (err, writing) => {
            if (err) return callback('database_error');
  
            const searchTitle = new Set();
            const searchSubtitle = new Set();
  
            writing.title.split(' ').forEach(word => searchTitle.add(word));
            writing.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
            writing.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
            writing.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
            writing.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
            writing.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
  
            Writing.findByIdAndUpdate(writing._id, {$set: {
              search_title: Array.from(searchTitle).join(' '),
              search_subtitle: Array.from(searchSubtitle).join(' ')
            }}, err => {
              if (err) return callback('database_error');

              const oldImages = oldContent.filter(each => each.includes(IMAGE_IDENTIFIER_CLASS_NAME)).map(each => each.split('src="')[1]?.split('"')[0]?.trim())?.filter(each => each.length);
              const newImages = writing.content
                .concat(writing.translations.tr.content)
                .concat(writing.translations.ru.content)
                .filter(each => each.includes(IMAGE_IDENTIFIER_CLASS_NAME))?.map(each => each.split('src="')[1]?.split('"')[0]?.trim())?.filter(each => each.length);

              async.timesSeries(
                oldImages.length,
                (time, next) => {
                  if (newImages.includes(oldImages[time]))
                    return next(null);

                  return Image.findImageByUrlAndDelete(oldImages[time], err => next(err));
                },
                err => {
                  if (err) return callback(err);

                  Writing.collection
                    .createIndex(
                      { search_title: 'text', search_subtitle: 'text' },
                      { weights: {
                        search_title: 10,
                        search_subtitle: 1
                      } }
                    )
                    .then(() => callback(null))
                    .catch(_ => callback('index_error'));
                }
              );
            });
          });
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndUpdateTranslations = function (id, parent_id, data, callback) {
  const Writing = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    if (!writing.is_completed)
      return callback('not_authenticated_request');

    const oldContent = writing.content.concat(writing.translations.tr.content).concat(writing.translations.ru.content);
      
    const translations = formatTranslations(writing, data.language, data);
    let oldIdentifier = toURLString(writing.translations[data.language]?.title);
    const newIdentifier = toURLString(translations[data.language].title);

    if (oldIdentifier == toURLString(writing.title))
      oldIdentifier = null;

    Writing.findOne({
      _id: { $ne: writing._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = writing.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(writing.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = writing.identifier_languages[key]
      });
  
      Writing.findByIdAndUpdate(writing._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, (err, writing) => {
        if (err) return callback('database_error');
  
        const searchTitle = new Set();
        const searchSubtitle = new Set();

        writing.title.split(' ').forEach(word => searchTitle.add(word));
        writing.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
        writing.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
        writing.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        writing.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        writing.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));

        Writing.findByIdAndUpdate(writing._id, {$set: {
          search_title: Array.from(searchTitle).join(' '),
          search_subtitle: Array.from(searchSubtitle).join(' ')
        }}, err => {
          if (err) return callback('database_error');

          const oldImages = oldContent.filter(each => each.includes(IMAGE_IDENTIFIER_CLASS_NAME)).map(each => each.split('src="')[1]?.split('"')[0]?.trim())?.filter(each => each.length);
          const newImages = writing.content
            .concat(writing.translations.tr.content)
            .concat(writing.translations.ru.content)
            .filter(each => each.includes(IMAGE_IDENTIFIER_CLASS_NAME))?.map(each => each.split('src="')[1]?.split('"')[0]?.trim())?.filter(each => each.length);

          async.timesSeries(
            oldImages.length,
            (time, next) => {
              if (newImages.includes(oldImages[time]))
                return next(null);

              return Image.findImageByUrlAndDelete(oldImages[time], err => next(err));
            },
            err => {
              if (err) return callback(err);

              Writing.collection
                .createIndex(
                  { search_title: 'text', search_subtitle: 'text' },
                  { weights: {
                    search_title: 10,
                    search_subtitle: 1
                  } }
                )
                .then(() => callback(null))
                .catch(_ => callback('index_error'));
            }
          );
        });
      });
    });
  });
};

WritingSchema.statics.findWritingsByParentIdAndFilters = function (parent_id, data, callback) {
  const Writing = this;

  if (!parent_id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');
    
  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {
    parent_id: mongoose.Types.ObjectId(parent_id.toString())
  };

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = { $regex: data.title.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Writing
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(writings => async.timesSeries(
        writings.length,
        (time, next) => Writing.findWritingByIdAndParentIdAndFormat(writings[time]._id, parent_id, (err, writing) => next(err, writing)),
        (err, writings) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            writings
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Writing
      .find(filters)
      .sort({
        score: { $meta: 'textScore' }, 
        order: -1
      })
      .limit(limit)
      .skip(skip)
      .then(writings => async.timesSeries(
        writings.length,
        (time, next) => Writing.findWritingByIdAndParentIdAndFormat(writings[time]._id, parent_id, (err, writing) => next(err, writing)),
        (err, writings) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            writings
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

WritingSchema.statics.findWritingCountByParentIdAndFilters = function (parent_id, data, callback) {
  const Writing = this;

  if (!parent_id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {
    parent_id: mongoose.Types.ObjectId(parent_id.toString())
  };

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = { $regex: data.title.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Writing
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Writing
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

WritingSchema.statics.findWritingByIdAndParentIdAndDelete = function (id, parent_id, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);
    if (writing.is_deleted) return callback(null);

    Writing.findByIdAndUpdate(writing._id, {$set: {
      title: writing.title + writing._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      Writing.find({
        parent_id: writing.parent_id,
        order: { $gt: writing.order }
      }, (err, writings) => {
        if (err) return callback('database_error');

        async.timesSeries(
          writings.length,
          (time, next) => Writing.findByIdAndUpdate(writings[time]._id, {$inc: {
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

WritingSchema.statics.findWritingByIdAndParentIdAndRestore = function (id, parent_id, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);
    if (!writing.is_deleted) return callback(null);

    identifiers = [ toURLString(writing.title.replace(writing._id.toString(), '')) ];
    const identifierLanguages = {
      [identifiers[0]]: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.values(writing.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.title);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(writing.translations)[index]; 
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Writing.findOne({ identifiers: identifiers[time] }, (err, writing) => {
        if (err) return next('database_error');
        if (writing) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Writing.findWritingCountByParentIdAndFilters(parent_id, { is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Writing.findByIdAndUpdate(writing._id, {
            title: writing.title.replace(writing._id.toString(), ''),
            identifiers,
            identifier_languages: identifierLanguages,
            is_deleted: false,
            order
          }, err => {
            if (err) return callback('database_error');
  
            return callback(null);
          });
        });
      }
    );
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndIncOrderByOne = function (id, parent_id, callback) {
  const Writing = this;

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);
    if (writing.is_deleted) return callback('not_authenticated_request');

    Writing.findOne({
      parent_id: writing.parent_id,
      order: writing.order + 1
    }, (err, prev_writing) => {
      if (err) return callback('database_error');
      if (!prev_writing) return callback(null);

      Writing.findByIdAndUpdate(writing._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Writing.findByIdAndUpdate(prev_writing._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

WritingSchema.statics.uploadWritingContentImage = function (file, callback) {
  Image.createImage({
    file_name: file.filename,
    original_name: generateRandomHEX(DEFAULT_IMAGE_RANDOM_NAME_LENGTH),
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    is_used: true
  }, (err, url) => callback(err, url));
};

module.exports = mongoose.model('Writing', WritingSchema);
