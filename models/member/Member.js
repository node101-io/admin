const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getMember = require('./functions/getMember');
const getMemberByLanguage = require('./functions/getMemberByLanguage');
const isMemberComplete = require('./functions/isMemberComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 300;
const IMAGE_NAME_PREFIX = 'node101 member ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const MemberSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  created_at: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    default: null,
    trim: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
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

MemberSchema.statics.createMember = function (data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const newMemberData = {
    name: data.name.trim(),
    created_at: (new Date())
  };

  const newMember = new Member(newMemberData);

  newMember.save((err, member) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err) return callback('bad_request');
    
    return callback(null, member._id.toString());
  });
};

MemberSchema.statics.findMemberById = function (id, callback) {
  const Member = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Member.findById(mongoose.Types.ObjectId(id.toString()), (err, member) => {
    if (err) return callback('database_error');
    if (!member) return callback('document_not_found');

    if (member.is_completed)
      return callback(null, member);

    if (!isMemberComplete(member))
      return callback(null, member);

    Member.findByIdAndUpdate(member._id, {$set: {
      is_completed: true
    }}, { new: true }, (err, member) => {
      if (err) return callback('database_error');

      return callback(null, member);
    });
  });
};

MemberSchema.statics.findMemberByIdAndFormat = function (id, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);

    getMember(member, (err, member) => {
      if (err) return callback(err);

      return callback(null, member);
    });
  });
};

MemberSchema.statics.findMemberByIdAndFormatByLanguage = function (id, language, callback) {
  const Member = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);

    if (!member.is_completed)
      return callback('not_authenticated_request');

    getMemberByLanguage(member, language, (err, member) => {
      if (err) return callback(err);

      return callback(null, member);
    });
  });
};

MemberSchema.statics.findMemberByIdAndUpdateImage = function (id, file, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + member.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Member.findByIdAndUpdate(member._id, { $set: {
        image: url
      }}, { new: false }, (err, member) => {
        if (err) return callback(err);

        if (!member.image || member.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(member.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

MemberSchema.statics.findMemberByIdAndUpdate = function (id, data, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    Member.findByIdAndUpdate(member._id, {$set: {
      name: data.name.trim(),
      title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : member.title,
      social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
    }}, err => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

MemberSchema.statics.findMemberByIdAndUpdateTranslations = function (id, data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);

    if (!member.is_completed)
      return callback('not_authenticated_request');

    Member.findByIdAndUpdate(member._id, {$set: {
      translations: formatTranslations(member, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

MemberSchema.statics.findMembersByFilters = function (data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? limit * parseInt(data.page) : 0;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Member
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .then(members => async.timesSeries(
      members.length,
      (time, next) => Member.findMemberByIdAndFormat(members[time], (err, member) => next(err, member)),
      (err, members) => {
        if (err) return callback(err);

        return callback(null, members);
      })
    )
    .catch(_ => callback('database_error'));
};

MemberSchema.statics.findMemberCountByFilters = function (data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = data.name.trim();

  Member
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Member', MemberSchema);
