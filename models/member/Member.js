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
  },
  order: {
    type: Number,
    required: true
  }
});

MemberSchema.statics.createMember = function (data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Member.findMemberCountByFilters({ is_deleted: false }, (err, order) => {
    if (err) return callback(err);

    const newMemberData = {
      name: data.name.trim(),
      created_at: (new Date()),
      order
    };
  
    const newMember = new Member(newMemberData);
  
    newMember.save((err, member) => {
      if (err) return callback('bad_request');

      member.translations = formatTranslations(member, 'tr');

      Member.findByIdAndUpdate(member._id, {$set: {
        translations: formatTranslations(member, 'ru')
      }}, err => {
        if (err) return callback('database_error');

        return callback(null, member._id.toString());
      });
    });
  });
};

MemberSchema.statics.findMemberById = function (id, callback) {
  const Member = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Member.findById(mongoose.Types.ObjectId(id.toString()), (err, member) => {
    if (err) return callback('database_error');
    if (!member) return callback('document_not_found');

    const is_completed = isMemberComplete(member);

    if (member.is_completed == is_completed)
      return callback(null, member);

    Member.findByIdAndUpdate(member._id, {$set: {
      is_completed: is_completed
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
      translations: formatTranslations(member, data.language, data)
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
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;
  let search = null;

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
    search = data.search.trim();
    filters.name = { $regex: search, $options: 'i' };
  };

  Member
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ name: 1 })
    .then(members => async.timesSeries(
      members.length,
      (time, next) => Member.findMemberByIdAndFormat(members[time]._id, (err, member) => next(err, member)),
      (err, members) => {
        if (err) return callback(err);

        return callback(null, {
          search,
          limit,
          page,
          members
        });
      })
    )
    .catch(_ => callback('database_error'));
};

MemberSchema.statics.findMemberCountByFilters = function (data, callback) {
  const Member = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.search.trim(), $options: 'i' };

  Member
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

MemberSchema.statics.findMemberByIdAndDelete = function (id, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);
    if (member.is_deleted) return callback(null);

    Member.findByIdAndUpdate(member._id, { $set: {
      is_deleted: true,
      order: null
    } }, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

MemberSchema.statics.findMemberByIdAndRestore = function (id, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);
    if (!member.is_deleted) return callback(null);

    Member.findMemberCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      Member.findByIdAndUpdate({
        is_deleted: false,
        order
      }, err => {
        if (err) return callback('database_error');

        return callback(null);
      });
    });
  });
};

MemberSchema.statics.findMemberByIdAndIncOrderByOne = function (id, callback) {
  const Member = this;

  Member.findMemberById(id, (err, member) => {
    if (err) return callback(err);
    if (member.is_deleted) return callback('not_authenticated_request');

    Member.findOne({
      order: member.order + 1
    }, (err, prev_member) => {
      if (err) return callback('database_error');
      if (!prev_member)
        return callback(null);

      Member.findByIdAndUpdate(member._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Member.findByIdAndUpdate(prev_member._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

module.exports = mongoose.model('Member', MemberSchema);
