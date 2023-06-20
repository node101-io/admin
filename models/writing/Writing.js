const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const generateRandomHEX = require('../../utils/generateRandomHEX');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Writer = require('../writer/Writer');

const checkAndUpdateWritingFilter = require('./functions/checkAndUpdateWritingFilter');
const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getWriting = require('./functions/getWriting');
const getWritingByLanguage = require('./functions/getWritingByLanguage');
const isWritingComplete = require('./functions/isWritingComplete');

const DEFAULT_IMAGE_RANDOM_NAME_LENGTH = 32;
const DEFAULT_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const LOGO_HEIGHT = 300;
const LOGO_WIDTH = 300;
const COVER_HEIGHT = 414;
const COVER_WIDTH = 752;
const IMAGE_WIDTH = 500;
const LOGO_NAME_PREFIX = 'node101 writing logo ';
const COVER_NAME_PREFIX = 'node101 writing cover ';
const IMAGE_IDENTIFIER_CLASS_NAME = 'general-writing-image';
const LABEL_VALUES = ['slider', 'editors_pick', 'exclusive'];
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
  parent_identifiers: {
    type: Array,
    default: []
  },
  parent_identifier_languages: {
    type: Object,
    default: {}
  },
  parent_title: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  parent_image: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
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
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  logo: {
    type: String,
    default: null,
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
  label: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  flag: {
    type: String,
    default: '',
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
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
  order: {
    type: Number,
    required: true
  },
  is_hidden: {
    type: Boolean,
    default: false
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  view_count: {
    type: Number,
    default: 0
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

  if (!data.parent_info || typeof data.parent_info != 'object')
    data.parent_info = {};

  const identifier = toURLString(data.title);
  const parent_id = mongoose.Types.ObjectId(_parent_id.toString());

  Writing.findOne({
    parent_id,
    identifiers: identifier
  }, (err, writing) => {
    if (err) return callback('database_error');
    if (writing) return callback('duplicated_unique_field');

    Writer.findWriterById(data.writer_id, (err, writer) => {
      if (err) return callback(err);

      Writing.findWritingCountByParentIdAndFilters(parent_id, { is_deleted: false }, (err, order) => {
        if (err) return callback(err);

        const newWritingData = {
          title: data.title.trim(),
          identifiers: [ identifier ],
          identifier_languages: { [identifier]: DEFAULT_LANGUAGE },
          type: data.type,
          parent_id,
          parent_identifiers: data.parent_info.identifiers && Array.isArray(data.parent_info.identifiers) && data.parent_info.identifiers.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.parent_info.identifiers : [],
          parent_identifier_languages: data.parent_info.identifier_languages && typeof data.parent_info.identifier_languages == 'object' && Object.keys(data.parent_info.identifier_languages).length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.parent_info.identifier_languages : {},
          parent_title: data.parent_info.title && typeof data.parent_info.title == 'string' && data.parent_info.title.trim().length && data.parent_info.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_info.title.trim() : null,
          parent_image: data.parent_info.image && typeof data.parent_info.image == 'string' && data.parent_info.image.trim().length && data.parent_info.image.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_info.image.trim() : null,
          writer_id: writer._id,
          created_at: new Date(),
          order
        };

        const newWriting = new Writing(newWritingData);

        newWriting.save((err, writing) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');

          writing.translations = formatTranslations(writing, 'tr');
          writing.translations = formatTranslations(writing, 'ru');

          if (data.parent_info.translations && typeof data.parent_info.translations == 'object')
            Object.keys(data.parent_info.translations).forEach(language => {
              const eachParentInfo = data.parent_info.translations[language];

              Object.keys(eachParentInfo).forEach(key => {
                writing.translations[language][`parent_${key}`] = eachParentInfo[key];
              });
            });

          Writing.findByIdAndUpdate(writing._id, {$set: {
            translations: writing.translations
          }}, err => {
            if (err) return callback('database_error');

            return callback(null, writing._id.toString());
          });
        });
      });
    });
  });
};

WritingSchema.statics.createWritingByParentIdWithoutWriter = function (_parent_id, data, callback) {
  const Writing = this;

  if (!_parent_id || !validator.isMongoId(_parent_id.toString()))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.type || !TYPE_VALUES.includes(data.type))
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.parent_info || typeof data.parent_info != 'object')
    data.parent_info = {};

  const identifier = toURLString(data.title);
  const parent_id = mongoose.Types.ObjectId(_parent_id.toString());

  Writing.findOne({
    parent_id,
    identifiers: identifier
  }, (err, writing) => {
    if (err) return callback('database_error');
    if (writing) return callback('duplicated_unique_field');

    Writing.findWritingCountByParentIdAndFilters(parent_id, { is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newWritingData = {
        title: data.title.trim(),
        parent_title: data.title.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_LANGUAGE },
        type: data.type,
        parent_id,
        parent_identifiers: data.parent_info.identifiers && Array.isArray(data.parent_info.identifiers) && data.parent_info.identifiers.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.parent_info.identifiers : [],
        parent_identifier_languages: data.parent_info.identifier_languages && typeof data.parent_info.identifier_languages == 'object' && Object.keys(data.parent_info.identifier_languages).length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.parent_info.identifier_languages : {},
        parent_title: data.parent_info.title && typeof data.parent_info.title == 'string' && data.parent_info.title.trim().length && data.parent_info.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_info.title.trim() : null,
        parent_image: data.parent_info.image && typeof data.parent_info.image == 'string' && data.parent_info.image.trim().length && data.parent_info.image.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_info.image.trim() : null,
        created_at: new Date(),
        order
      };

      const newWriting = new Writing(newWritingData);

      newWriting.save((err, writing) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        writing.translations = formatTranslations(writing, 'tr');
        writing.translations = formatTranslations(writing, 'ru');

        if (data.parent_info.translations && typeof data.parent_info.translations == 'object')
          Object.keys(data.parent_info.translations).forEach(language => {
            const eachParentInfo = data.parent_info.translations[language];

            Object.keys(eachParentInfo).forEach(key => {
              writing.translations[language][`parent_${key}`] = eachParentInfo[key];
            });
          });

        Writing.findByIdAndUpdate(writing._id, {$set: {
          translations: writing.translations
        }}, err => {
          if (err) return callback('database_error');

          return callback(null, writing._id.toString());
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentId = function (id, parent_id, callback) {
  const Writing = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  if (!parent_id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  Writing.findById(mongoose.Types.ObjectId(id.toString()), (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');
    if (writing.parent_id.toString() != parent_id.toString())
      return callback('not_authenticated_request');

    if (writing.is_completed == isWritingComplete(writing))
      return checkAndUpdateWritingFilter(writing, err => {
        if (err) return callback(err);

        return callback(null, writing);
      });

    Writing.findByIdAndUpdate(writing._id, {$set: {
        is_completed: isWritingComplete(writing)
    }}, { new: true }, (err, writing) => {
      if (err) return callback('database_error');

      checkAndUpdateWritingFilter(writing, err => {
        if (err) return callback(err);

        return callback(null, writing);
      });
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

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    getWritingByLanguage(writing, language, (err, writing) => {
      if (err) return callback(err);

      return callback(null, writing);
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdUpdateLogo = function (id, parent_id, file, callback) {
  const Writing = this;

  if (!file || !file.filename)
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: LOGO_NAME_PREFIX + writing.title,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      Writing.findByIdAndUpdate(writing._id, { $set: {
          logo: url
      }}, { new: false }, (err, writing) => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!writing.logo || writing.logo.split('/')[writing.logo.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(writing.logo, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdUpdateLogoTranslation = function (id, parent_id, language, file, callback) {
  const Writing = this;

  if (!file || !file.filename)
    return callback('bad_request');

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    const translations = JSON.parse(JSON.stringify(writing.translations));

    if (!translations[language]) return callback('bad_request');

    Image.createImage({
      file_name: file.filename,
      original_name: LOGO_NAME_PREFIX + writing.title + '-' + language,
      width: LOGO_WIDTH,
      height: LOGO_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      translations[language].logo = url;

      Writing.findByIdAndUpdate(writing._id, { $set: {
          translations
      }}, { new: false }, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          const oldLogo = translations[language].logo;

          if (!oldLogo || oldLogo.split('/')[oldLogo.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(oldLogo, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndUpdateCover = function (id, parent_id, file, callback) {
  const Writing = this;

  if (!file || !file.filename)
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: COVER_NAME_PREFIX + writing.title,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      Writing.findByIdAndUpdate(writing._id, { $set: {
          cover: url
      }}, { new: false }, (err, writing) => {
        if (err) return callback(err);

        deleteFile(file, err => {
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
  });
};

WritingSchema.statics.findWritingByIdAndParentIdAndUpdateCoverTranslation = function (id, parent_id, language, file, callback) {
  const Writing = this;

  if (!file || !file.filename)
    return callback('bad_request');

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Writing.findWritingByIdAndParentId(id, parent_id, (err, writing) => {
    if (err) return callback(err);

    const translations = JSON.parse(JSON.stringify(writing.translations));

    if (!translations[language]) return callback('bad_request');

    Image.createImage({
      file_name: file.filename,
      original_name: COVER_NAME_PREFIX + writing.title + '-' + language,
      width: COVER_WIDTH,
      height: COVER_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);

      translations[language].cover = url;

      Writing.findByIdAndUpdate(writing._id, { $set: {
          translations
      }}, { new: false }, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          const oldCover = translations[language].cover;

          if (!oldCover || oldCover.split('/')[oldCover.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(oldCover, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
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
        identifier: DEFAULT_LANGUAGE
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
            label: data.label && typeof data.label == 'string' && LABEL_VALUES.includes(data.label) ? data.label : writing.label,
            flag: data.flag && typeof data.flag == 'string' && data.flag.trim().length && data.flag.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.flag.trim() : writing.flag,
            social_media_accounts: getSocialMediaAccounts(data.social_media_accounts),
            content: data.content && Array.isArray(data.content) && data.content.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.content : writing.content,
            is_hidden: 'is_hidden' in data ? (data.is_hidden ? true : false) : writing.is_hidden
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

                return callback(null);
              }
            );
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

    data.logo = writing.translations[data.language] ? writing.translations[data.language].logo : null;
    data.cover = writing.translations[data.language] ? writing.translations[data.language].cover : null;

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

            return callback(null);
          }
        );
      });
    });
  });
};

WritingSchema.statics.findWritingsByParentIdAndUpdateParentInfo = function (parent_id, data, callback) {
  const Writing = this;

  if (!parent_id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Writing
    .find({ parent_id })
    .countDocuments()
    .then(count =>
      async.timesSeries(
        parseInt(count / MAX_DOCUMENT_COUNT_PER_QUERY + (count % MAX_DOCUMENT_COUNT_PER_QUERY ? 1 : 0)),
        (time, next) => 
          Writing
            .find({ parent_id })
            .skip(time * MAX_DOCUMENT_COUNT_PER_QUERY)
            .limit(MAX_DOCUMENT_COUNT_PER_QUERY)
            .then(writings => 
              async.timesSeries(
                writings.length,
                (time, next) => {
                  const writing = writings[time];

                  if (data.translations && typeof data.translations == 'object')
                    Object.keys(data.translations).forEach(language => {
                      const eachParentInfo = data.translations[language];

                      Object.keys(eachParentInfo).forEach(key => {
                        writing.translations[language][`parent_${key}`] = eachParentInfo[key];
                      });
                    });

                  Writing.findByIdAndUpdate(writing._id, {$set: {
                    parent_identifiers: data.identifiers && Array.isArray(data.identifiers) && data.identifiers.length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.identifiers : [],
                    parent_identifier_languages: data.identifier_languages && typeof data.identifier_languages == 'object' && Object.keys(data.identifier_languages).length < MAX_DATABASE_ARRAY_FIELD_LENGTH ? data.identifier_languages : {},
                    parent_title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writing.parent_title,
                    parent_image: data.image && typeof data.image == 'string' && data.image.trim().length && data.image.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.image.trim() : writing.parent_image,
                    translations: JSON.parse(JSON.stringify(writing.translations))
                  }}, err => {
                    if (err) return next('database_error');

                    return next(null);
                  })
                },
                err => next(err)
              )
            )
            .catch(_ => next('database_error'))
        ,
        err => callback(err)
      )
    )
    .catch(_ => callback('database_error'));
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
      [identifiers[0]]: DEFAULT_LANGUAGE
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
          if (err) return callback('database_error');

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
    is_used: true
  }, (err, url) => callback(err, url));
};

WritingSchema.statics.findWritingByIdAndUpdateParentId = function (id, parent_id, callback) { // This function is only to be used by Book / Chapter model, as these models do not make use of the Writing model's order field.
  const Writing = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  if (!parent_id || !validator.isMongoId(parent_id.toString()))
    return callback('bad_request');

  Writing.findById(mongoose.Types.ObjectId(id.toString()), (err, writing) => {
    if (err) return callback('database_error');
    if (!writing) return callback('document_not_found');

    Writing.findByIdAndUpdate(writing._id, {$set: {
      parent_id: mongoose.Types.ObjectId(parent_id.toString())
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

WritingSchema.statics.findWritingByIdAndForceDelete = function (id, callback) { // This function is only to be used by Book / Chapter model
  const Writing = this;

  Writing.findWritingById(id, (err, writing) => {
    if (err) return callback(err);

    WritingFilter.findWritingFilterByWritingIdAndDeleteAll(writing._id, err => {
      if (err) return callback(err);

      Writing.findByIdAndDelete(writing._id, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

module.exports = mongoose.model('Writing', WritingSchema);
