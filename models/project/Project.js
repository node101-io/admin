const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toMongoId = require('../../utils/toMongoId');
const toURLString = require('../../utils/toURLString');

const Image = require('../image/Image');
const Stake = require('../stake/Stake');

const formatTranslations = require('./functions/formatTranslations');
const generateSearchField = require('./functions/generateSearchField');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const isProjectComplete = require('./functions/isProjectComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 project ';
const LANGUAGE_VALUES = ['tr', 'ru'];
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const PROJECT_RATING_MIN_VALUE = 1;
const PROJECT_RATING_MAX_VALUE = 5;

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
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
  search: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  created_at: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
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
  },
  stake_id: {
    type: mongoose.Types.ObjectId,
    default: null,
    sparse: true
  }
});

ProjectSchema.statics.formatProject = function (project, callback) {
  const Project = this;

  if (!project || !project._id)
    return callback('document_not_found');

  const update = {};
  const isCompleted = isProjectComplete(project);
  const search = generateSearchField(project);

  if (isCompleted != project.is_completed)
    update.$set = {
      is_completed: isCompleted
    };

  if (search.find(any => !project.search.includes(any)))
    update.$push = {
      search: { $each: search.filter(each => !project.search.includes(each)) }
    };
  if (project.search.find(any => !search.includes(any)))
    update.$pull = {
      search: { $in: project.search.filter(each => !search.includes(each)) }
    };

  if (!Object.keys(update).length)
    return callback(null, {
      _id: project._id.toString(),
      name: project.name,
      identifier: project.identifiers[0],
      description: project.description,
      rating: project.rating,
      image: project.image,
      is_completed: project.is_completed,
      social_media_accounts: project.social_media_accounts,
      translations: project.translations,
    });

  Project.findByIdAndUpdate(mongoose.Types.ObjectId(project._id.toString()), update, { new: true }, (err, project) => {
    if (err) return callback('database_error');

    return callback(null, {
      _id: project._id.toString(),
      name: project.name,
      identifier: project.identifiers[0],
      description: project.description,
      rating: project.rating,
      image: project.image,
      is_completed: project.is_completed,
      social_media_accounts: project.social_media_accounts,
      translations: project.translations,
    });
  });
};

ProjectSchema.statics.formatProjectByLanguage = function (project, language, callback) {
  const Project = this;

  if (!language || !LANGUAGE_VALUES.includes(language))
    return callback('bad_request');

  let translation = JSON.parse(JSON.stringify(
    project.translations[language] && typeof project.translations[language] == 'object' ? project.translations[language] : {}
  ));

  if (!translation.name || !translation.name.trim().length)
    translation.name = project.name;
  if (!translation.description || !translation.description.trim().length)
    translation.description = project.description;
  if (!translation.social_media_accounts || !Object.keys(translation.social_media_accounts).length)
    translation.social_media_accounts = project.social_media_accounts;

  return callback(null, {
    _id: project._id.toString(),
    name: translation.name,
    identifier: project.identifiers.find(each => project.identifier_languages[each] == language) || project.identifiers[0],
    description: translation.description,
    rating: project.rating,
    image: project.image,
    is_completed: project.is_completed,
    social_media_accounts: translation.social_media_accounts,
  });
};

ProjectSchema.statics.findProjectById = function (id, callback) {
  const Project = this;

  Project.findById(toMongoId(id), (err, project) => {
    if (err) return callback('database_error');
    if (!project) return callback('document_not_found');

    return callback(null, project);
  });
};

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
        description: null,
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        translations: {},
        social_media_accounts: {},
        order
      };

      LANGUAGE_VALUES.forEach(lang => {
        newProjectData.translations = formatTranslations(newProjectData, lang);
      });

      const newProject = new Project(newProjectData);

      newProject.save((err, project) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        Project.formatProject(project, (err, project) => {
          if (err) return callback(err);

          return callback(null, project);
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndFormat = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    Project.formatProject(project, (err, project) => {
      if (err) return callback(err);

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndFormatByLanguage = function (id, language, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);

    Project.formatProjectByLanguage(project, language, (err, project) => {
      if (err) return callback(err);

      return callback(null, project);
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdate = function (id, data, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback('database_error');
    if (project.is_deleted) return callback('not_authenticated_request');

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.name);
    const oldIdentifier = toURLString(project.name);

    Project.findOne({
      _id: { $ne: project._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = project.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(project.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = project.identifier_languages[key]
      });

      Project.findByIdAndUpdate(project._id, {$set: {
        name: data.name.trim(),
        identifiers,
        identifier_languages,
        description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : project.description,
        rating: data.rating && data.rating >= PROJECT_RATING_MIN_VALUE && data.rating <= PROJECT_RATING_MAX_VALUE ? data.rating : project.rating,
        social_media_accounts: getSocialMediaAccounts(data.social_media_accounts),
      }}, { new: true }, (err, project) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        LANGUAGE_VALUES.forEach(lang => project.translations = formatTranslations(project, lang, project.translations[lang]))
  
        Project.findByIdAndUpdate(project._id, {$set: {
          translations: project.translations
        }}, { new: true }, (err, project) => {
          if (err) return callback('database_error');

          Project.formatProject(project, (err, project) => {
            if (err) return callback(err);

            return callback(null, project);
          });
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdateImage = function (id, file, callback) {
  const Project = this;

  Project.findProjectById(id, (err, old_project) => {
    if (err) return callback('database_error');
    if (old_project.is_deleted)
      return callback('not_authenticated_request');

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + old_project.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Project.findByIdAndUpdate(old_project._id, { $set: {
        image: url
      }}, { new: true }, (err, project) => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!old_project.image || old_project.image.split('/').pop() == url.split('/').pop())
            return callback(null, url);

          Image.findImageByUrlAndDelete(old_project.image, err => {
            if (err) return callback(err);

            Project.formatProject(project, (err, project) => {
              if (err) return callback(err);

              return callback(null, url, project);
            });
          });
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndUpdateTranslations = function (id, data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !LANGUAGE_VALUES.includes(data.language))
    return callback('bad_request');

  Project.findProjectById(id, (err, project) => {
    if (err) return callback('database_error');
    if (project.is_deleted || !project.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(project, data.language, data);
    let oldIdentifier = toURLString(project.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    if (oldIdentifier == toURLString(project.name))
      oldIdentifier = null;

    Project.findOne({
      _id: { $ne: project._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = project.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(project.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = project.identifier_languages[key]
      });
  
      Project.findByIdAndUpdate(project._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, (err, project) => {
        if (err) return callback('database_error');
  
        Project.formatProject(project, (err, project) => {
          if (err) return callback(err);
  
          return callback(null, project);
        });
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
  let search = null;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
    search = data.search.trim();
    filters.search = { $regex: data.search.trim(), $options: 'i' };
  }

  Project
    .find(filters)
    .sort({ order: -1 })
    .limit(limit)
    .skip(skip)
    .then(projects => async.timesSeries(
      projects.length,
      (time, next) => Project.formatProject(projects[time], (err, project) => next(err, project)),
      (err, projects) => {
        if (err) return callback(err);

        return callback(null, {
          search,
          limit,
          page,
          projects
        });
      })
    )
    .catch(_ => callback('database_error'));
};

ProjectSchema.statics.findProjectCountByFilters = function (data, callback) {
  const Project = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.search = { $regex: data.search.trim(), $options: 'i' };

  Project
    .find(filters)
    .countDocuments()
    .then(count => callback(null, count))
    .catch(_ => callback('database_error'));
};

ProjectSchema.statics.findProjectByIdAndDelete = function (id, callback) {
  const Project = this;

  Project.findByIdAndUpdate(toMongoId(id), {$set: {
    identifiers: [],
    identifier_languages: {},
    is_deleted: true,
    order: null
  }}, { new: true }, (err, project) => {
    if (err) return callback('database_error');
    if (!project) return callback('document_not_found');

    Project.updateMany({
      order: { $gt: project.order }
    }, {$inc: {
      order: -1
    }}, err => {
      if (err) return callback('database_error');
    
      Project.formatProject(project, (err, project) => {
        if (err) return callback(err);

        return callback(null, project);
      });
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
      }}, { new: true }, (err, project) => {
        if (err) return callback('database_error');

        Project.findByIdAndUpdate(prev_project._id, {$inc: {
          order: -1
        }}, { new: true }, (err, prev_project) => {
          if (err) return  callback('database_error');

          Stake.findStakeByIdAndSetOrder(project.stake_id, project.order, _ => {
            Stake.findStakeByIdAndSetOrder(prev_project.stake_id, prev_project.order, _ => 
              callback(null)
            );
          });
        });
      });
    });
  });
};

ProjectSchema.statics.findProjectByIdAndBringToTop = function (id, callback) {
  const Project = this;

  Project.findProjectById(id, (err, project) => {
    if (err) return callback(err);
    if (project.is_deleted) return callback('not_authenticated_request');

    Project.updateMany({
      order: { $gt: project.order }
    }, {$inc: {
      order: -1
    }}, err => {
      if (err) return callback('database_error');

      Project.findProjectCountByFilters({ is_deleted: false }, (err, order) => {
        if (err) return callback(err);

        Project.findByIdAndUpdate(project._id, {$set: {
          order
        }}, { new: true }, (err, project) => {
          if (err) return callback('database_error');

          Project.formatProject(project, (err, project) => {
            if (err) return callback(err);

            return callback(null, project);
          });
        });
      });
    });
  });
};

// ProjectSchema.statics.findProjectByIdAndGetStake = function (id, callback) {
//   const Project = this;

//   Project.findProjectById(id, (err, project) => {
//     if (err) return callback(err);
//     if (!project.stake_id)
//       return callback('document_not_found');

//     Stake.findStakeByIdAndFormat(project.stake_id, (err, stake) => callback(err, stake));
//   });
// };

// ProjectSchema.statics.findProjectByIdAndCreateStake = function (id, callback) {
//   const Project = this;

//   Project.findProjectById(id, (err, project) => {
//     if (err) return callback(err);
//     if (project.stake_id)
//       return callback(null);

//     if (!project.is_completed)
//       return callback('not_authenticated_request');

//     Stake.createStake({
//       project_id: project._id,
//       search_name: project.search_name,
//       search_description: project.search_description,
//       order: project.order
//     }, (err, id) => {
//       if (err) return callback(err);

//       Project.findByIdAndUpdate(project._id, {$set: {
//         stake_id: mongoose.Types.ObjectId(id.toString())
//       }}, err => {
//         if (err) return callback('database_error');

//         return callback(null, id);
//       });
//     });
//   });
// };

// ProjectSchema.statics.findProjectByIdAndUpdateStake = function (id, data, callback) {
//   const Project = this;

//   Project.findProjectById(id, (err, project) => {
//     if (err) return callback(err);
//     if (!project.stake_id)
//       return callback('bad_request');

//     Stake.findStakeByIdAndUpdate(project.stake_id, data, err => callback(err));
//   });
// };

// ProjectSchema.statics.findProjectByIdAndUpdateStakeTranslations = function (id, data, callback) {
//   const Project = this;

//   Project.findProjectById(id, (err, project) => {
//     if (err) return callback(err);
//     if (!project.stake_id)
//       return callback('bad_request');

//     Stake.findStakeByIdAndUpdateTranslations(project.stake_id, data, err => callback(err));
//   });
// };

// ProjectSchema.statics.findProjectByIdAndUpdateStakeImage = function (id, file, callback) {
//   const Project = this;

//   Project.findProjectById(id, (err, project) => {
//     if (err) return callback(err);
//     if (!project.stake_id)
//       return callback('bad_request');

//     Stake.findStakeByIdAndUpdateImage(project.stake_id, file, project.name, err => callback(err));
//   });
// };

// ProjectSchema.statics.findProjectByIdAndRevertStakeIsActive = function (id, callback) {
//   const Project = this;

//   Project.findStakeByIdAndUpdateTranslations(id, (err, project) => {
//     if (err) return callback(err);
//     if (!project.stake_id)
//       return callback('bad_request');

//     Stake.findStakeByIdAndRevertIsActive(project.stake_id, err => callback(err));
//   });
// };

module.exports = mongoose.model('Project', ProjectSchema);
