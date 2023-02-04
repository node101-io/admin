const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getProject = require('./functions/getProject');
const getProjectByLanguage = require('./functions/getProjectByLanguage');
const isProjectComplete = require('./functions/isProjectComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 project ';
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const PROJECT_RATING_MIN_VALUE = 1;
const PROJECT_RATING_MAX_VALUE = 5;

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: { // List of identifiers. Created based on Project title on different languages
    type: Array,
    required: true,
    minlength: 0,
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  identifier_languages: { // Principal language of each identifier. Default to en
    type: Object,
    default: {}
  },
  created_at: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  rating: {
    type: Number,
    default: null,
    min: PROJECT_RATING_MIN_VALUE,
    max: PROJECT_RATING_MAX_VALUE
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
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
  translations: {
    type: Object,
    default: {}
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

ProjectSchema.statics.createProject = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.name);

  Project.findOne({
    identifiers: identifier
  }, (err, project) => {
    if (err) return callback('database_error');
    if (project) return callback('duplicated_unique_field');

    Project.findProjectCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newProjectData = {
        name: data.name.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        order
      };
    
      const newProject = new Project(newProjectData);
    
      newProject.save((err, project) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        project.translations = formatTranslations(project, 'tr');

        Project.findByIdAndUpdate(project._id, {$set: {
          translations: formatTranslations(project, 'ru')
        }}, err => {
          if (err) return callback('database_error');

          Project.collection
            .createIndex(
              { name: 'text', description: 'text' },
              { weights: {
                name: 10,
                description: 1
              } }
            )
            .then(() => callback(null, project._id.toString()))
            .catch(err => callback('index_error'));
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectById = function (id, callback) {
  const Project = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Project.findById(mongoose.Types.ObjectId(id.toString()), (err, project) => {
    if (err) return callback('database_error');
    if (!project) return callback('document_not_found');

    const is_completed = isProjectComplete(project);

    if (project.is_completed == is_completed)
      return callback(null, project);

    Project.findByIdAndUpdate(project._id, {$set: {
      is_completed: is_completed
    }}, { new: true }, (err, project) => {
      if (err) return callback('database_error');

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdentifierAndFormatByLanguage = function (identifier, language, callback) {
  const Project = this;

  Project.findOne({
    identifiers: identifier
  }, (err, project) => {
    if (err) return callback('database_error');
    if (!project)
      return callback('document_not_found');

    if (!project.is_completed)
      return callback('not_authenticated_request');

    if (!language || !validator.isISO31661Alpha2(language.toString()))
      language = project.identifier_languages[identifier];

    getProjectByLanguage(project, language, (err, project) => {
      if (err) return callback(err);

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndFormat = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    getProject(project, (err, project) => {
      if (err) return callback(err);

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndFormatByLanguage = function (id, language, callback) {
  const Project = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    if (!project.is_completed)
      return callback('not_authenticated_request');

    getProjectByLanguage(project, language, (err, project) => {
      if (err) return callback(err);

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdateImage = function (id, file, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + project.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Project.findByIdAndUpdate(project._id, { $set: {
        image: url
      }}, { new: false }, (err, project) => {
        if (err) return callback(err);

        if (!project.image || project.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(project.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdate = function (id, data, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.name);

    Project.findOne({
      _id: { $ne: project._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate && duplicate._id.toString() != project._id.toString())
        return callback('duplicated_unique_field');

      const identifiers = project.identifiers.filter(each => each != toURLString(project.name)).concat(newIdentifier);

      const identifier_languages = {
        identifier: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(project.identifier_languages).forEach(key => {
        if (key != toURLString(project.name))
          identifier_languages[key] = project.identifier_languages[key]
      });

      Project.findByIdAndUpdate(project._id, {$set: {
        name: data.name.trim(),
        identifiers,
        identifier_languages,
        description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.description.trim() : project.description,
        rating: data.rating && data.rating >= PROJECT_RATING_MIN_VALUE && data.rating <= PROJECT_RATING_MAX_VALUE ? data.rating : project.rating,
        social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
      }}, { new: true }, (err, project) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        project.translations = formatTranslations(project, 'tr', project.translations.tr);
  
        Project.findByIdAndUpdate(project._id, {$set: {
          translations: formatTranslations(project, 'ru', project.translations.ru)
        }}, err => {
          if (err) return callback('database_error');

          Project.collection
            .createIndex(
              { name: 'text', description: 'text' },
              { weights: {
                name: 10,
                description: 1
              } }
            )
            .then(() => callback(null))
            .catch(err => callback('index_error'));
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdateTranslations = function (id, data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    if (!project.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(project, data.language, data);
    const oldIdentifier = toURLString(project.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    Project.findOne({
      identifiers: newIdentifier
    }, (err, project) => {
      if (err) return callback('database_error');
      if (project) return callback('duplicated_unique_field');

      const identifiers = project.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);
      const identifier_languages = {
        newIdentifier: data.language
      };
  
      Object.keys(project.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = project.identifier_languages[key]
      });
  
      Project.findByIdAndUpdate(project._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

ProjectSchema.statics.findProjectsByFilters = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Project
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(projects => async.timesSeries(
        projects.length,
        (time, next) => Project.findProjectByIdAndFormat(projects[time]._id, (err, project) => next(err, project)),
        (err, projects) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            projects
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Project
      .find(filters)
      .sort({
        score: { $meta: 'textScore' }, 
        order: -1
      })
      .limit(limit)
      .skip(skip)
      .then(projects => async.timesSeries(
        projects.length,
        (time, next) => Project.findProjectByIdAndFormat(projects[time]._id, (err, project) => next(err, project)),
        (err, projects) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            projects
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

ProjectSchema.statics.findProjectCountByFilters = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Project
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Project
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

ProjectSchema.statics.findProjectByIdAndDelete = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);
    if (project.is_deleted) return callback(null);

    Project.findByIdAndUpdate(project._id, {$set: {
      name: project.name + project._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndRestore = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);
    if (!project.is_deleted) return callback(null);

    identifiers = [ toURLString(project.name.replace(project._id.toString(), '')) ];
    const identifierLanguages = {
      [identifiers[0]]: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.values(project.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.name);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(project.translations)[index]; 
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Project.findOne({ identifiers: identifiers[time] }, (err, project) => {
        if (err) return next('database_error');
        if (project) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Project.findProjectCountByFilters({ is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Project.findByIdAndUpdate(project._id, {
            name: project.name.replace(project._id.toString(), ''),
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

ProjectSchema.statics.findProjectByIdAndIncOrderByOne = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);
    if (project.is_deleted) return callback('not_authenticated_request');

    Project.findOne({
      order: project.order + 1
    }, (err, prev_project) => {
      if (err) return callback('database_error');
      if (!prev_project)
        return callback(null);

      Project.findByIdAndUpdate(project._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Project.findByIdAndUpdate(prev_project._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Project', ProjectSchema);
