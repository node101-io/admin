const mongoose = require('mongoose');
const validator = require('validator');

const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Project = require('../project/Project');

const formatTranslations = require('./functions/formatTranslations');
const getFrequentlyAskedQuestions = require('./functions/getFrequentlyAskedQuestions');
const getGuide = require('./functions/getGuide');
const getGuideByLanguage = require('./functions/getGuideByLanguage');
const isGuideComplete = require('./functions/isGuideComplete');

const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 guide ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e5;

const Schema = mongoose.Schema;

const GuideSchema = new Schema({
  project_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
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
  }
});

GuideSchema.statics.createGuide = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectById(err, project => {
    if (err) return callback(err);

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
          project_id: project._id,
          title: data.title.trim(),
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

          guide.translations = formatTranslations(guide, 'tr');
          guide.translations = formatTranslations(guide, 'ru');

          Guide.findByIdAndUpdate(guide._id, {$set: {
            translations: guide.translations
          }}, err => {
            if (err) return callback('database_error');

            callback(null, guide._id.toString());
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

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

    if (!guide.is_completed)
      return callback('not_authenticated_request');

    getGuideByLanguage(guide, language, (err, guide) => {
      if (err) return callback(err);

      return callback(null, guide);
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

        if (!guide.image || guide.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(guide.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

GuideSchema.statics.findGuideByIdAndUpdate = function (id, data, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);


    Guide.findByIdAndUpdate(guide._id, {$set: {
      mainnet_explorer_url: data.mainnet_explorer_url && typeof data.mainnet_explorer_url == 'string' && data.mainnet_explorer_url.trim().length && data.mainnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.mainnet_explorer_url.trim() : null,
      testnet_explorer_url: data.testnet_explorer_url && typeof data.testnet_explorer_url == 'string' && data.testnet_explorer_url.trim().length && data.testnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.testnet_explorer_url.trim() : null,
      rewards: data.rewards && typeof data.rewards == 'string' && data.rewards.trim().length && data.rewards.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.rewards.trim() : null,
      lock_period: data.lock_period && typeof data.lock_period == 'string' && data.lock_period.trim().length && data.lock_period.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.lock_period.trim() : null,
      cpu: data.cpu && typeof data.cpu == 'string' && data.cpu.trim().length && data.cpu.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.cpu.trim() : null,
      ram: data.ram && typeof data.ram == 'string' && data.ram.trim().length && data.ram.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.ram.trim() : null,
      os: data.os && typeof data.os == 'string' && data.os.trim().length && data.os.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.os.trim() : null,
      network: data.network && typeof data.network == 'string' && data.network.trim().length && data.network.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.network.trim() : null,
      frequently_asked_questions: data.frequently_asked_questions && Array.isArray(data.frequently_asked_questions) ? data.frequently_asked_questions.filter(each =>
        each.question && typeof each.question == 'string' && each.question.trim().length && each.question.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
        each.answer && typeof each.answer == 'string' && each.answer.trim().length && each.answer.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH
      ).map(each => {
        return {
          question: each.question.trim(),
          answer: each.answer.trim()
        }
      }) : []
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
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

    Guide.findByIdAndUpdate(guide._id, {$set: {
      translations: formatTranslations(guide, data.language, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

GuideSchema.statics.findGuidesByFilters = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectsByFilters(data, (err, project_data) => {
    if (err) return callback(err);

    const data = {
      search: project_data.search,
      limit: project_data.limit,
      page: project_data.page,
      guides: []
    };

    const filters = {};

    if (!project_data.projects || !project_data.projects.length)
      return callback(null, data);

    if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
      filters.title = { $regex: data.search.trim(), $options: 'i' };
    };

    Guide
      .find({$and: [
        filters,
        { project_id: { $in: project_data.projects.map(each => mongoose.Types.ObjectId(each._id.toString())) } }
      ]})
      .sort({ order: -1 })
      .then(guides => async.timesSeries(
        guides.length,
        (time, next) => Guide.findGuideByIdAndFormat(guides[time]._id, (err, guide) => next(err, guide)),
        (err, guides) => {
          if (err) return callback(err);

          data.guides = guides;
  
          return callback(null, data);
        })
      )
      .catch(_ => callback('database_error'));
  });
};

GuideSchema.statics.findGuideCountByFilters = function (data, callback) {
  const Guide = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectsByFilters(data, (err, project_data) => {
    if (err) return callback(err);

    const filters = {};

    if (!project_data.projects || !project_data.projects.length)
      return callback(null, 0);

    if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
      filters.title = { $regex: data.search.trim(), $options: 'i' };
    };

    Guide
      .find({$and: [
        filters,
        { project_id: { $in: project_data.projects.map(each => mongoose.Types.ObjectId(each._id.toString())) } }
      ]})
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  });
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

GuideSchema.statics.findGuideByIdAndIncOrderByOne = function (id, callback) {
  const Guide = this;

  Guide.findGuideById(id, (err, guide) => {
    if (err) return callback(err);

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
            if (err) return callback(err);

            if (!project.is_deleted)
              return callback(null);

            return Guide.findGuideByIdAndIncOrderByOne(guide._id, err => callback(err));
          });
        });
      });
    });
  });
};

module.exports = mongoose.model('Guide', GuideSchema);
