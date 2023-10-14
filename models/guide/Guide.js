const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Project = require('../project/Project');
const Writing = require('../writing/Writing');

const formatTranslations = require('./functions/formatTranslations');
const getFrequentlyAskedQuestions = require('./functions/getFrequentlyAskedQuestions');
const getGuide = require('./functions/getGuide');
const getGuideByLanguage = require('./functions/getGuideByLanguage');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getSystemRequirements = require('./functions/getSystemRequirements');
const isGuideComplete = require('./functions/isGuideComplete');

const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 guide ';
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;


const Schema = mongoose.Schema;

const GuideSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: {
    type: Array,
    required: true,
    minlength: 0,
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  identifier_languages: {
    type: Object,
    default: {}
  },
  project_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  subtitle: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  search_title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_subtitle: {
    type: String,
    default: '',
    trim: true,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  created_at: {
    type: Date,
    required: true
  },
  image: {
    type: String,
    default: null,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  mainnet_explorer_url: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  testnet_explorer_url: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  rewards: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  lock_period: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  cpu: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  ram: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  os: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  network: {
    type: String,
    default: '',
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  frequently_asked_questions: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
    /*
      Format:
      [{
        question: String,
        answer: String
      }]
    */
  },
  is_deleted: {
    type: Boolean,
    default: false
  },
  social_media_accounts: {
    type: Object,
    default: {}
  },
  translations: {
    type: Object,
    default: {}
  },
  is_active: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  },
  writing_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  wizard_key: {
    type: String,
    default: null,
    trim: true,
    minlength: 0,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  system_requirements: {
    type: Object,
    default: {}
  },
  is_mainnet: {
    type: Boolean,
    default: false
  },
});

GuideSchema.statics.createGuide = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

    if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.title);

  Guide.findOne({
    identifiers: identifier
  }, (err, guide) => {
    if (err) return callback('database_error');
    if (guide) return callback('duplicated_unique_field');

    Guide.findGuideCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newGuideData = {
        title: data.title.trim(),
        search_title: data.title.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        order
      };

      const newGuide = new Guide(newGuideData);
    
      newGuide.save((err, guide) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        Writing.createWritingByParentIdWithoutWriter(guide._id, {
          type: 'guide',
          title: data.title.trim()
        }, (err, writing_id) => {
          if (err) return callback(err);
  
          guide.translations = formatTranslations(guide, 'tr');
          guide.translations = formatTranslations(guide, 'ru');

          Guide.findByIdAndUpdate(guide._id, {$set: {
            translations: guide.translations,
            writing_id: mongoose.Types.ObjectId(writing_id)
          }}, err => {
            if (err) return callback('database_error');
            
            Guide.collection
              .createIndex(
                { search_title: 'text', search_subtitle: 'text' },
                { weights: {
                  search_title: 10,
                  search_subtitle: 1
                } }
              )
              .then(() => callback(null, guide._id.toString()))
              .catch(_ => callback('index_error'));       
          });
        });
      });
    });
  });
};

GuideSchema.statics.findGuideById = function (id, callback) {
  const Guide = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Guide.findById(mongoose.Types.ObjectId(id.toString()), (err, guide) => {
    if (err) return callback('database_error');
    if (!guide) return callback('document_not_found');

    if (guide.is_completed == isGuideComplete(guide))
      return callback(null, guide);

    Guide.findByIdAndUpdate(guide._id, {$set: {
      is_completed: isGuideComplete(guide)
    }}, { new: true }, (err, guide) => {
      console.log(err);
      if (err) return callback('database_error');

      return callback(null, guide);
    });
  });
};

GuideSchema.statics.findGuideByIdAndFormat = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    getGuide(guide, (err, guide) => {
      if (err) return callback(err);

      return callback(null, guide);
    });
  });
};

GuideSchema.statics.findGuideByIdAndFormatByLanguage = function (id, language, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    getGuideByLanguage(guide, language, (err, guide) => {
      if (err) return callback(err);

      return callback(null, guide);
    });
  });
};

GuideSchema.statics.findGuideByIdAndUpdate = function (id, data, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);
    if (guide.is_deleted) return callback('not_authenticated_request');

    if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.title);
    const oldIdentifier = toURLString(guide.title);

    Guide.findOne({
      _id: { $ne: guide._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = guide.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(guide.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = guide.identifier_languages[key]
      });

      Project.findProjectById(data.project_id, (project_err, project) => {
        Guide.findByIdAndUpdate(guide._id, {$set: {
          title: data.title.trim(),
          identifiers,
          identifier_languages,
          subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : guide.subtitle,
          type: data.type && TYPE_VALUES.includes(data.type) ? data.type : guide.type,
          project_id: !project_err ? project._id : guide.project_id,
          social_media_accounts: getSocialMediaAccounts(data.social_media_accounts),
          mainnet_explorer_url: data.mainnet_explorer_url && typeof data.mainnet_explorer_url == 'string' && data.mainnet_explorer_url.trim().length && data.mainnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.mainnet_explorer_url.trim() : null,
          testnet_explorer_url: data.testnet_explorer_url && typeof data.testnet_explorer_url == 'string' && data.testnet_explorer_url.trim().length && data.testnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.testnet_explorer_url.trim() : null,
          rewards: data.rewards && typeof data.rewards == 'string' && data.rewards.trim().length && data.rewards.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.rewards.trim() : null,
          lock_period: data.lock_period && typeof data.lock_period == 'string' && data.lock_period.trim().length && data.lock_period.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.lock_period.trim() : null,
          cpu: data.cpu && typeof data.cpu == 'string' && data.cpu.trim().length && data.cpu.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.cpu.trim() : null,
          ram: data.ram && typeof data.ram == 'string' && data.ram.trim().length && data.ram.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.ram.trim() : null,
          os: data.os && typeof data.os == 'string' && data.os.trim().length && data.os.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.os.trim() : null,
          network: data.network && typeof data.network == 'string' && data.network.trim().length && data.network.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.network.trim() : null,
          frequently_asked_questions: getFrequentlyAskedQuestions(data.frequently_asked_questions),
          wizard_key: data.wizard_key && typeof data.wizard_key == 'string' && data.wizard_key.trim().length && data.wizard_key.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.wizard_key.trim() : null,
          is_mainnet: (is_mainnet in data) && typeof data.is_mainnet == 'boolean' ? data.is_mainnet : guide.is_mainnet,
          system_requirements: getSystemRequirements(data.system_requirements)
        }}, { new: true }, (err, guide) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');
  
          guide.translations = formatTranslations(guide, 'tr', guide.translations.tr);
          guide.translations = formatTranslations(guide, 'ru', guide.translations.ru);
    
          Guide.findByIdAndUpdate(guide._id, {$set: {
            translations: guide.translations
          }}, { new: true }, (err, guide) => {
            if (err) return callback('database_error');
  
            const searchTitle = new Set();
            const searchSubtitle = new Set();

            guide.title.split(' ').forEach(word => searchTitle.add(word));
            guide.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
            guide.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
            guide.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
            guide.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
            guide.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));

            Guide.findByIdAndUpdate(guide._id, {$set: {
              search_title: Array.from(searchTitle).join(' '),
              search_subtitle: Array.from(searchSubtitle).join(' ')
            }}, err => {
              if (err) return callback('database_error');

              Writing.findWritingByIdAndParentIdAndUpdate(guide.writing_id, guide._id, {
                title: guide.title,
                subtitle: guide.subtitle
              }, err => {
                if (err) return callback(err);

                Guide.collection
                  .createIndex(
                    { search_title: 'text', search_subtitle: 'text' },
                    { weights: {
                      search_title: 10,
                      search_subtitle: 1
                    } }
                  )
                  .then(() => callback(null))
                  .catch(_ => callback('index_error'));
              });
            });
          });
        });
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndUpdateTranslations = function (id, data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    if (!guide.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(guide, data.language, data);
    let oldIdentifier = toURLString(guide.translations[data.language]?.title);
    const newIdentifier = toURLString(translations[data.language].title);

    if (oldIdentifier == toURLString(guide.title))
      oldIdentifier = null;

    Guide.findOne({
      _id: { $ne: guide._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = guide.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(guide.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = guide.identifier_languages[key]
      });
  
      Guide.findByIdAndUpdate(guide._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, (err, guide) => {
        if (err) return callback('database_error');
  
        const searchTitle = new Set();
        const searchSubtitle = new Set();

        guide.title.split(' ').forEach(word => searchTitle.add(word));
        guide.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
        guide.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
        guide.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        guide.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        guide.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));

        Guide.findByIdAndUpdate(guide._id, {$set: {
          search_title: Array.from(searchTitle).join(' '),
          search_subtitle: Array.from(searchSubtitle).join(' ')
        }}, err => {
          if (err) return callback('database_error');

          Writing.findWritingByIdAndParentIdAndUpdateTranslations(guide.writing_id, guide._id, {
            language: data.language,
            title: data.title,
            subtitle: data.subtitle
          }, err => {
            if (err) return callback(err);

            Guide.collection
              .createIndex(
                { search_title: 'text', search_subtitle: 'text' },
                { weights: {
                  search_title: 10,
                  search_subtitle: 1
                } }
              )
              .then(() => callback(null))
              .catch(_ => callback('index_error'));
          });
        });
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndUpdateImage = function (id, file, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + guide.title,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Guide.findByIdAndUpdate(guide._id, { $set: {
        image: url
      }}, { new: false }, (err, guide) => {
        if (err) return callback(err);

        Writing.findWritingByIdAndParentIdUpdateLogo(guide.writing_id, guide._id, file, err => {
          if (err) return callback(err);

          if (!guide.image || guide.image.split('/')[guide.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(guide.image, err => {
            if (err) return callback(err);

            deleteFile(file, err => {
              if (err) return callback(err);
  
              return callback(null, url);
            });
          });
        });
      });
    });
  });
};

GuideSchema.statics.findGuidesByFilters = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if ('is_mainnet' in data)
    filters.is_mainnet = data.is_mainnet ? true : false;
  
  if ('is_completed' in data)
    filters.is_completed = data.is_completed ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Guide
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(guides => async.timesSeries(
        guides.length,
        (time, next) => Guide.findGuideByIdAndFormat(guides[time]._id, (err, guide) => next(err, guide)),
        (err, guides) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            guides
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Guide
      .find(filters)
      .sort({
        score: { $meta: 'textScore' }, 
        order: -1
      })
      .limit(limit)
      .skip(skip)
      .then(guides => async.timesSeries(
        guides.length,
        (time, next) => Guide.findGuideByIdAndFormat(guides[time]._id, (err, guide) => next(err, guide)),
        (err, guides) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            guides
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

GuideSchema.statics.findGuideCountByFilters = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;
  
  if ('is_completed' in data)
    filters.is_completed = data.is_completed ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Guide
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(err => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Guide
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

GuideSchema.statics.findGuideByIdAndRevertIsActive = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    Guide.findByIdAndUpdate(guide._id, {$set: {
      is_active: !guide.is_active
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

GuideSchema.statics.findGuideByIdAndDelete = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);
    if (guide.is_deleted) return callback(null);

    Guide.findByIdAndUpdate(guide._id, {$set: {
      title: guide.title + guide._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      Guide.find({
        order: { $gt: guide.order }
      }, (err, guides) => {
        if (err) return callback('database_error');

        async.timesSeries(
          guides.length,
          (time, next) => Guide.findByIdAndUpdate(guides[time]._id, {$inc: {
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

GuideSchema.statics.findGuideByIdAndRestore = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);
    if (!guide.is_deleted) return callback(null);

    identifiers = [ toURLString(guide.title.replace(guide._id.toString(), '')) ];
    const identifierLanguages = {
      [identifiers[0]]: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.values(guide.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.title);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(guide.translations)[index]; 
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Guide.findOne({ identifiers: identifiers[time] }, (err, guide) => {
        if (err) return next('database_error');
        if (guide) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Guide.findGuideCountByFilters({ is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Guide.findByIdAndUpdate(guide._id, {
            title: guide.title.replace(guide._id.toString(), ''),
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

GuideSchema.statics.findGuideByIdAndIncOrderByOne = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);
    if (guide.is_deleted) return callback('not_authenticated_request');

    Guide.findOne({
      order: guide.order + 1
    }, (err, prev_guide) => {
      if (err) return callback('database_error');
      if (!prev_guide) return callback(null);

      Guide.findByIdAndUpdate(guide._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Guide.findByIdAndUpdate(prev_guide._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return callback('database_error');

          Project.findProjectById(prev_guide.project_id, (err, project) => {
            if (prev_guide.project_id && err) return callback(err);

            if (!project || !project.is_deleted)
              return callback(null);

            return Guide.findGuideByIdAndIncOrderByOne(guide._id, err => callback(err));
          });
        });
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndGetWritingAndUpdate = function (id, data, callback) {
  const Guide = this;

  Guide.findGuideByIdAndUpdate(id, data, err => {
    if (err) return callback(err);

    Guide.findGuideById(id, (err, guide) => {
      if (err) return callback(err);

      Writing.findWritingByIdAndParentIdAndUpdate(guide.writing_id, guide._id, {
        title: guide.title,
        subtitle: guide.subtitle,
        content: data.content
      }, err => {
        if (err) return callback(err);

        return callback(null);
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndGetWritingAndUpdateTranslations = function (id, data, callback) {
  const Guide = this;

  Guide.findGuideByIdAndUpdateTranslations(id, data, err => {
    if (err) return callback(err);

    Guide.findGuideById(id, (err, guide) => {
      if (err) return callback(err);

      Writing.findWritingByIdAndParentIdAndUpdateTranslations(guide.writing_id, guide._id, {
        language: data.language,
        title: guide.title,
        subtitle: guide.subtitle,
        content: data.content
      }, err => {
        if (err) return callback(err);

        return callback(null);
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndGetWritingAndUpdateCover = function (id, file, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdateCover(
      guide.writing_id,
      guide._id,
      file,
      (err, url) => callback(err, url)
    );
  });
};

module.exports = mongoose.model('Guide', GuideSchema);
