const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toMongoId = require('../../utils/toMongoId');

const Image = require('../image/Image');

const generateRandomHex = require('./functions/generateRandomHex');
const formatAdmin = require('./functions/formatAdmin');
const hashPassword = require('./functions/hashPassword');
const verifyPassword = require('./functions/verifyPassword');

const DEFAULT_IMAGE_ROUTE = '/res/images/default/admin.webp';
const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 50;
const IMAGE_WIDTH = 50;
const IMAGE_NAME_PREFIX = 'node101 admin ';
const MIN_PASSWORD_LENGTH = 8;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const RANDOM_PASSWORD_LENGTH = 16;
const ROLE_VALUES = [
  'blog_view', 'blog_create', 'blog_edit', 'blog_order', 'blog_delete',
  'book_view', 'book_create', 'book_edit', 'book_order', 'book_delete',
  'guide_view', 'guide_create', 'guide_edit', 'guide_order', 'guide_delete',
  'member_view', 'member_create', 'member_edit', 'member_order', 'member_delete',
  'project_view', 'project_create', 'project_edit', 'project_order', 'project_delete',
  'stake_view', 'stake_create', 'stake_edit', 'stake_order', 'stake_delete',
  'tag_view', 'tag_create', 'tag_edit', 'tag_order', 'tag_delete',
  'wizard_view', 'wizard_edit',
  'writer_view', 'writer_create', 'writer_edit', 'writer_order', 'writer_delete'
];

const Schema = mongoose.Schema;

const AdminSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  password: {
    type: String,
    trim: true,
    required: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  name: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  roles: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  image: {
    type: String,
    default: DEFAULT_IMAGE_ROUTE,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  }
});

AdminSchema.pre('save', hashPassword);

AdminSchema.statics.findAdminByEmailAndVerifyPassword = function (data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.email || typeof data.email != 'string')
    return callback('bad_request');

  if (!data.password || typeof data.password != 'string')
    return callback('bad_request');

  Admin.findOne({
    email: data.email.trim()
  }, (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    verifyPassword(data.password.trim(), admin.password, res => {
      if (!res) return callback('password_verification');

      formatAdmin(admin, (err, admin) => {
        if (err) return callback(err);

        return callback(null, admin);
      });
    });
  });
};

AdminSchema.statics.findAdminByIdAndFormat = function (id, callback) {
  const Admin = this;

  Admin.findById(toMongoId(id), (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    formatAdmin(admin, (err, admin) => {
      if (err) return callback(err);

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.createAdmin = function (data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.email || typeof data.email != 'string' || !data.email.trim().length || data.email.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH || !validator.isEmail(data.email.trim()))
    return callback('bad_request');

  const newAdmin = new Admin({
    email: data.email.trim(),
    password: generateRandomHex(RANDOM_PASSWORD_LENGTH)
  });

  newAdmin.save((err, admin) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err)
      return callback('database_error');

    formatAdmin(admin, (err, admin) => {
      if (err) return callback(err);

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.findAdminByIdAndDelete = function (id, callback) {
  const Admin = this;

  Admin.findByIdAndDelete(toMongoId(id), (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    formatAdmin(admin, (err, admin) => {
      if (err) return callback(err);

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.findAdminByIdAndUpdate = function (id, data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const update = {};

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    update.name = data.name.trim();

  if (data.roles && Array.isArray(data.roles))
    update.roles = data.roles.filter(each => ROLE_VALUES.includes(each));

  if (!update || !Object.keys(update).length)
    return callback('bad_request');

  Admin.findByIdAndUpdate(toMongoId(id), { $set: update }, { new: true }, (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    formatAdmin(admin, (err, admin) => {
      if (err) return callback(err);

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.findAdminByIdAndResetPassword = function (id, data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.password || typeof data.password != 'string' || data.password.trim().length < MIN_PASSWORD_LENGTH || data.password.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Admin.findById(toMongoId(id), (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    admin.password = data.password;

    admin.save((err, admin) => {
      if (err) return callback('database_error');

      formatAdmin(admin, (err, admin) => {
        if (err) return callback(err);
  
        return callback(null, admin);
      });
    });
  });
};

AdminSchema.statics.findAdminByIdAndUpdateImage = function (id, file, callback) {
  const Admin = this;

  Admin.findById(toMongoId(id), (err, old_admin) => {
    if (err) return callback('database_error');
    if (!old_admin) return callback('document_not_found');

    if (!old_admin.is_completed)
      return callback('not_authenticated_request');

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + old_admin.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
    
      Admin.findByIdAndUpdate(old_admin._id, { $set: {
        image: url
      }}, { new: true }, (err, admin) => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!old_admin.image || old_admin.image == DEFAULT_IMAGE_ROUTE || old_admin.image.split('/').pop() == url.split('/').pop())
            return callback(null, admin);

          Image.findImageByUrlAndDelete(old_admin.image, err => {
            if (err) return callback(err);

            formatAdmin(admin, (err, admin) => {
              if (err) return callback(err);
        
              return callback(null, admin);
            });
          });
        });
      });
    });
  });
};

AdminSchema.statics.findAdminsByFilters = function (data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;
  let search = null;

  const filters = {};

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH) {
    search = data.search.trim();
    filters.$or = [
      { name: { $regex: data.search.trim(), $options: 'i' } },
      { email: { $regex: data.search.trim(), $options: 'i' } }
    ];
  }

  Admin
    .find(filters)
    .sort({ email: 1 })
    .limit(limit)
    .skip(skip)
    .then(admins => async.timesSeries(
      admins.length,
      (time, next) => formatAdmin(admins[time], (err, admin) => next(err, admin)),
      (err, admins) => {
        if (err) return callback(err);

        return callback(null, {
          search,
          limit,
          page,
          admins
        });
      })
    )
    .catch(_ => callback('database_error'));
};

AdminSchema.statics.findAdminCountByFilters = function (data, callback) {
  const Admin = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.search && typeof data.search == 'string' && data.search.trim().length && data.search.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.$or = [
      { name: { $regex: data.search.trim(), $options: 'i' } },
      { email: { $regex: data.search.trim(), $options: 'i' } }
    ];

  Admin
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Admin', AdminSchema);
