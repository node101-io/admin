const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Image = require('../image/Image');

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const getBlog = require('./functions/getBlog');
const getBlogByLanguage = require('./functions/getBlogByLanguage');
const isBlogComplete = require('./functions/isBlogComplete');

const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 20;
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 300;
const IMAGE_NAME_PREFIX = 'node101 blog image ';
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;
const TYPE_VALUES = ['node101', 'project', 'terms'];

const Schema = mongoose.Schema;

const BlogSchema = new Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: {
    type: Array,
    required: true,
    minlength: 1
  },
  identifier_languages: {
    type: Object,
    default: {}
  },
  type: {
    type: String,
    default: null,
  },
  project_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  writer_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  subtitle: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  image: {
    type: String,
    default: null,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  is_active: {
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
  writing_count: {
    type: Number,
    default: 0
  }
});

BlogSchema.statics.createBlog = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const newBlogData = {
    title: data.title.trim()
  };

  const newBlog = new Blog(newBlogData);

  newBlog.save((err, blog) => {
    if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
      return callback('duplicated_unique_field');
    if (err) return callback('bad_request');
    
    return callback(null, blog._id.toString());
  });
};

BlogSchema.statics.findBlogById = function (id, callback) {
  const Blog = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Blog.findById(mongoose.Types.ObjectId(id.toString()), (err, blog) => {
    if (err) return callback('database_error');
    if (!blog) return callback('document_not_found');

    if (blog.is_completed)
      return callback(null, blog);

    if (!isBlogComplete(blog))
      return callback(null, blog);

    Blog.findByIdAndUpdate(blog._id, {$set: {
      is_completed: true
    }}, { new: true }, (err, blog) => {
      if (err) return callback('database_error');

      return callback(null, blog);
    });
  });
};

BlogSchema.statics.findBlogByIdAndFormat = function (id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    getBlog(blog, (err, blog) => {
      if (err) return callback(err);

      return callback(null, blog);
    });
  });
};

BlogSchema.statics.findBlogByIdAndFormatByLanguage = function (id, language, callback) {
  const Blog = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (!blog.is_completed)
      return callback('not_authenticated_request');

    getBlogByLanguage(blog, language, (err, blog) => {
      if (err) return callback(err);

      return callback(null, blog);
    });
  });
};

BlogSchema.statics.findBlogByIdAndUpdateCover = function (id, file, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + blog.title,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Blog.findByIdAndUpdate(blog._id, { $set: {
        image: url
      }}, { new: false }, (err, blog) => {
        if (err) return callback(err);

        if (!blog.image || blog.image == url)
          return callback(null, url);

        Image.findImageByUrlAndDelete(blog.image, err => {
          if (err) return callback(err);

          return callback(null, url);
        });
      });
    });
  });
};

BlogSchema.statics.findBlogByIdAndUpdate = function (id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    Blog.findByIdAndUpdate(blog._id, {$set: {
      title: data.title.trim(),
      subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : null,
      social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

BlogSchema.statics.findBlogByIdAndUpdateTranslations = function (id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Blog.findByIdAndUpdate(blog._id, {$set: {
      translations: formatTranslations(blog, data)
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

BlogSchema.statics.findBlogsByFilters = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};
  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const skip = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? limit * parseInt(data.page) : 0;

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = data.title.trim();

  Blog
    .find(filters)
    .limit(limit)
    .skip(skip)
    .sort({ title: 1 })
    .then(blogs => async.timesSeries(
      blogs.length,
      (time, next) => Blog.findBlogByIdAndFormat(blogs[time], (err, blog) => next(err, blog)),
      (err, blogs) => {
        if (err) return callback(err);

        return callback(null, blogs);
      })
    )
    .catch(_ => callback('database_error'));
};

BlogSchema.statics.findBlogCountByFilters = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = data.title.trim();

  Blog
    .find(filters)
    .countDocuments()
    .then(number => callback(null, number))
    .catch(_ => callback('database_error'));
};

module.exports = mongoose.model('Blog', BlogSchema);
