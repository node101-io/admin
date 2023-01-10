const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');

const generateRandomHex = require('./functions/generateRandomHex');
const hashPassword = require('./functions/hashPassword');
const getAdmin = require('./functions/getAdmin');
const verifyPassword = require('./functions/verifyPassword');

const DEFAULT_IMAGE_ROUTE = '/res/images/default/admin.webp';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 50;
const IMAGE_WIDTH = 50;
const IMAGE_NAME_PREFIX = 'node101 team member ';
const MIN_PASSWORD_LENGTH = 8;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e4;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const RANDOM_PASSWORD_LENGTH = 16;

const role_values = [
  'blog_view', 'blog_create', 'blog_edit', 'blog_order', 'blog_delete',
  'book_view', 'book_create', 'book_edit', 'book_order', 'book_delete',
  'guide_view', 'guide_create', 'guide_edit', 'guide_order', 'guide_delete',
  'member_view', 'member_create', 'member_edit', 'member_order', 'member_delete',
  'project_view', 'project_create', 'project_edit', 'project_order', 'project_delete',
  'stake_view', 'stake_create', 'stake_edit', 'stake_order', 'stake_delete',
  'writer_view', 'writer_create', 'writer_edit', 'writer_order', 'writer_delete',
  'writing_view', 'writing_create', 'writing_edit', 'writing_order', 'writing_delete'
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
  is_completed: {
    type: Boolean,
    default: false
  },
  password: {
    type: String,
    required: true,
    minlength: MIN_PASSWORD_LENGTH,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  name: {
    type: String,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH,
    required: true,
    unique: true
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

  if (!data || !data.email || !validator.isEmail(data.email) || !data.password)
    return callback('bad_request');

  Admin.findOne({
    email: data.email.trim()
  }, (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    verifyPassword(data.password.trim(), admin.password, res => {
      if (!res) return callback('password_verification');

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.findAdminById = function (id, callback) {
  const Admin = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Admin.findById(mongoose.Types.ObjectId(id.toString()), (err, admin) => {
    if (err) return callback('database_error');
    if (!admin) return callback('document_not_found');

    return callback(null, admin);
  });
};

AdminSchema.statics.findAdminByIdAndFormat = function (id, callback) {
  const Admin = this;

  Admin.findAdminById(id, (err, admin) => {
    if (err) return callback(err);

    getAdmin(admin, (err, admin) => {
      if (err) return callback(err);

      return callback(null, admin);
    });
  });
};

AdminSchema.statics.createAdmin = function (data, callback) {
  const Admin = this;

  if (!data || typeof data != 'string')
    return callback('bad_request');

  if (!data.email || !validator.isEmail(data.email.toString()))
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  let roles = [];

  if (data.roles && Array.isArray(data.roles))
    roles = data.roles.filter(each => role_values.includes(each));

  Image.findImageByUrl(data.image, (err, image) => {
    const newAdminData = {
      email: data.email.toString().trim(),
      password: generateRandomHex(RANDOM_PASSWORD_LENGTH),
      name: data.name.trim(),
      roles
    };
  
    const newAdmin = new Admin(newAdminData);
  
    newAdmin.save((err, admin) => {
      if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
        return callback('duplicated_unique_field');
      if (err)
        return callback('database_error');
  
       return callback(null, admin._id.toString());
    });
  });
};

AdminSchema.statics.findAdminByIdAndDelete = function (id, callback) {
  const Admin = this;

  Admin.findAdminById(id, (err, admin) => {
    if (err) return callback(err);

    Admin.findByIdAndDelete(admin._id, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AdminSchema.statics.findAdminByIdAndUpdate = function (id, data, callback) {
  const Admin = this;

  if (!data || typeof data != 'string')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  let roles = [];

  if (data.roles && Array.isArray(data.roles))
    roles = data.roles.filter(each => role_values.includes(each));

  Admin.findAdminById(id, (err, admin) => {
    if (err) return callback(err);

    Admin.findByIdAndUpdate(admin._id, {$set: {
      name: data.name,
      roles,
      is_completed: true
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AdminSchema.statics.findAdminByIdAndResetPassword = function (id, data, callback) {
  const Admin = this;

  if (!data || typeof data != 'string')
    return callback('bad_request');

  if (!data.password || typeof data.password != 'string' || data.password.trim().length < MIN_PASSWORD_LENGTH || data.password.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Admin.findAdminById(id, (err, admin) => {
    if (err) return callback(err);

    admin.password = data.password;

    admin.save(err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

AdminSchema.statics.findAdminByIdAndUpdateImage = function (id, file, callback) {
  const Admin = this;

  Admin.findAdminById(id, (err, admin) => {
    if (err) return callback(err);

    if (!admin.name || !admin.name.length)
      return callback('bad_request');

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + admin.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
    
      Admin.findByIdAndUpdate(admin._id, { $set: {
        image: url
      }}, { new: false }, (err, admin) => {
        if (err) return callback(err);

        if (!admin.image || admin.image == DEFAULT_IMAGE_ROUTE || admin.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(admin.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

module.exports = mongoose.model('Admin', AdminSchema);
