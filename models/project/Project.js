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
  identifiers: { // List of identifier. Created based on Project title on different languages
    type: Array,
    required: true,
    minlength: 1
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

    const newProjectData = {
      name: data.name.trim(),
      identifiers: [ identifier ],
      identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
      created_at: new Date()
    };
  
    const newProject = new Project(newProjectData);
  
    newProject.save((err, project) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');
      
      return callback(null, project._id.toString());
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

    if (project.is_completed)
      return callback(null, project);

    if (!isProjectComplete(project))
      return callback(null, project);

    Project.findByIdAndUpdate(project._id, {$set: {
      is_completed: true
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

    const identifier = toURLString(data.name);

    Project.findOne({
      identifiers: identifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate && duplicate._id.toString() != project._id.toString())
        return callback('duplicated_unique_field');

      const identifier_languages = {
        identifier: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(project.identifier_languages).forEach(key => {
        if (key != toURLString(project.name))
          identifier_languages[key] = project.identifier_languages[key]
      });

      Project.findByIdAndUpdate(project._id, {$set: {
        name: data.name.trim(),
        identifiers: project.identifiers.filter(each => each != toURLString(project.name)).concat(identifier),
        identifier_languages,
        description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : project.description,
        rating: data.rating && data.rating >= PROJECT_RATING_MIN_VALUE && data.rating <= PROJECT_RATING_MAX_VALUE ? data.rating : project.rating,
        social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
      }}, err => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');
  
        return callback(null);
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

    const translations = formatTranslations(project, data);
    const oldIdentifier = toURLString(project.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    const identifier_languages = {
      newIdentifier: data.language
    };

    Object.keys(project.identifier_languages).forEach(key => {
      if (key != oldIdentifier)
        identifier_languages[key] = project.identifier_languages[key]
    });

    Project.findByIdAndUpdate(project._id, {$set: {
      identifiers: project.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier),
      identifier_languages,
      translations
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ProjectSchema.statics.findProjectsByFilters = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? limit * parseInt(data.page) : 0;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Project
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .then(projects => async.timesSeries(
      projects.length,
      (time, next) => Project.findProjectByIdAndFormat(projects[time], (err, project) => next(err, project)),
      (err, projects) => {
        if (err) return callback(err);

        return callback(null, projects);
      })
    )
    .catch(_ => callback('database_error'));
};

ProjectSchema.statics.findProjectCountByFilters = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Project
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Project', ProjectSchema);
