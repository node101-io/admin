const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');
const Project = require('../project/Project');

const formatTranslations = require('./functions/formatTranslations');
const getStake = require('./functions/getStake');
const getStakeByLanguage = require('./functions/getStakeByLanguage');
const isStakeComplete = require('./functions/isStakeComplete');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 200;
const IMAGE_WIDTH = 200;
const IMAGE_NAME_PREFIX = 'node101 stake ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const StakeSchema = new Schema({
  project_id: {
    type: mongoose.Types.ObjectId,
    unique: true,
    required: true
  },
  created_at: {
    type: Date,
    required: true
  },
  apr: {
    type: Number,
    default: null
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  stake_url: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  how_to_stake_url: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  not_yet_stakable: {
    type: Boolean,
    default: false
  },
  is_completed: {
    type: Boolean,
    default: false
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
  }
});

StakeSchema.statics.createStake = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Project.findProjectById(data.project_id, (err, project) => {
    if (err) return callback(err);

    Stake
      .find()
      .countDocuments()
      .then(order => {
        const newStakeData = {
          projet_id: project._id,
          created_at: new Date(),
          order
        };
    
        const newStake = new Stake(newStakeData);
    
        newStake.save((err, stake) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');

          stake.translations = formatTranslations(stake, 'tr');
          stake.translations = formatTranslations(stake, 'ru');

          Stake.findByIdAndUpdate(stake._id, {$set: {
            translations: stake.translations
          }}, err => {
            if (err) return callback('database_error');

            return callback(null, stake._id.toString());
          });
        });
      })
      .catch(_ => callback('database_error'));
  });
};

StakeSchema.statics.findStakeById = function (id, callback) {
  const Stake = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Stake.findById(mongoose.Types.ObjectId(id.toString()), (err, stake) => {
    if (err) return callback('database_error');
    if (!stake) return callback('document_not_found');

    if (stake.is_completed == isStakeComplete(stake))
      return callback(null, stake);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      is_completed: isStakeComplete(stake)
    }}, { new: true }, (err, stake) => {
      if (err) return callback('database_error');

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByProjectId = function (project_id, callback) {
  const Stake = this;

  if (!project_id || !validator.isMongoId(project_id.toString()))
    return callback('bad_request');

  Stake.findOne({
    project_id: mongoose.Types.ObjectId(project_id.toString())
  }, (err, stake) => {
    if (err) return callback('database_error');
    if (!stake) return callback('document_not_found');

    return callback(null, stake);
  });
};

StakeSchema.statics.findStakeByIdAndFormat = function (id, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    getStake(stake, (err, stake) => {
      if (err) return callback(err);

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByIdAndFormatByLanguage = function (id, language, callback) {
  const Stake = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    if (!stake.is_completed)
      return callback('not_authenticated_request');

    getStakeByLanguage(stake, language, (err, stake) => {
      if (err) return callback(err);

      return callback(null, stake);
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdateImage = function (id, file, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Project.findProjectById(stake.project_id, (err, project) => {
      if (err) return callback(err);

      Image.createImage({
        file_name: file.filename,
        original_name: IMAGE_NAME_PREFIX + project.name,
        width: IMAGE_WIDTH,
        height: IMAGE_HEIGHT,
        is_used: true
      }, (err, url) => {
        if (err) return callback(err);
    
        Stake.findByIdAndUpdate(stake._id, { $set: {
          image: url
        }}, { new: false }, (err, stake) => {
          if (err) return callback(err);
  
          if (!stake.image || stake.image == url)
            return callback(null, url);
  
          Image.findImageByUrlAndDelete(stake.image, err => {
            if (err) return callback(err);
  
            return callback(null, url);
          });
        });
      });
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdate = function (id, data, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      apr: data.apr && !isNaN(parseFloat(data.apr)) ? parseFloat(data.apr) : null,
      stake_url: data.stake_url && typeof data.stake_url == 'string' && data.stake_url.trim().length && data.stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.stake_url.trim() : null,
      how_to_stake_url: data.how_to_stake_url && typeof data.how_to_stake_url == 'string' && data.how_to_stake_url.trim().length && data.how_to_stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.how_to_stake_url.trim() : null,
      not_yet_stakable: data.not_yet_stakable ? true : false
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakeByIdAndUpdateTranslations = function (id, data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    if (!stake.is_completed)
      return callback('not_authenticated_request');

    Stake.findByIdAndUpdate(stake._id, {$set: {
      translations: formatTranslations(stake, data.language, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakesByFilters = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  data.is_deleted = false;

  Project.findProjectsByFilters(data, (err, project_data) => {
    if (err) return callback(err);
    
    const data = {
      search: project_data.search,
      limit: project_data.limit,
      page: project_data.page,
      stakes: []
    };

    if (!project_data.projects || !project_data.projects.length)
      return callback(null, data);
    
    Stake
      .find({
        project_id: { $in: project_data.projects.map(each => mongoose.Types.ObjectId(each._id.toString())) }
      })
      .sort({ order: -1 })
      .then(stakes => async.timesSeries(
        stakes.length,
        (time, next) => Stake.findStakeByIdAndFormat(stakes[time]._id, (err, stake) => next(err, stake)),
        (err, stakes) => {
          if (err) return callback(err);

          data.stakes = stakes;

          return callback(null, data);
        })
      )
      .catch(_ => callback('database_error'));
  })
};

StakeSchema.statics.findStakeCountByFilters = function (data, callback) {
  const Stake = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  data.is_deleted = false;

  Project.findProjectsByFilters(data, (err, project_data) => {
    if (err) return callback(err);

    if (!project_data.projects || !project_data.projects.length)
      return callback(null, 0);

    Stake
      .find({
        _id: { $in: project_data.projects.map(each => mongoose.Types.ObjectId(each._id.toString())) }
      })
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  });
};

StakeSchema.statics.findStakeByIdAndRevertIsActive = function (id, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);

    Stake.findByIdAndUpdate(stake._id, {$set: {
      is_active: !stake.is_active
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

StakeSchema.statics.findStakeByIdAndIncOrderByOne = function (id, callback) {
  const Stake = this;

  Stake.findStakeById(id, (err, stake) => {
    if (err) return callback(err);
    if (stake.is_deleted) return callback('not_authenticated_request');

    Stake.findOne({
      order: stake.order + 1
    }, (err, prev_stake) => {
      if (err) return callback('database_error');
      if (!prev_stake) return callback(null);

      Stake.findByIdAndUpdate(stake._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Stake.findByIdAndUpdate(prev_stake._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return callback('database_error');

          Project.findProjectById(prev_stake.project_id, (err, project) => {
            if (err) return callback(err);

            if (!project.is_deleted)
              return callback(null);

            return Stake.findStakeByIdAndIncOrderByOne(stake._id, err => callback(err));
          });
        });
      });
    });
  });
};

module.exports = mongoose.model('Stake', StakeSchema);
