const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toURLString =require('../../utils/toURLString')

const Image = require('../image/Image');
const Project = require('../project/Project');
const Writer = require('../writer/Writer');
const Writing = require('../writing/Writing')

const formatTranslations = require('./functions/formatTranslations');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts')
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
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
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
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  search_title: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    maxlength: MAX_DATABASE_LONG_TEXT_FIELD_LENGTH
  },
  search_subtitle: {
    type: String,
    default: '',
    trim: true,
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
  is_deleted: {
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
  writing_count: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    required: true
  }
});

BlogSchema.statics.createBlog = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.title);

  Blog.findOne({
    identifiers: identifier
  }, (err, blog) => {
    if (err) return callback('database_error');
    if (blog) return callback('duplicated_unique_field');

    Blog.findBlogCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newBlogData = {
        title: data.title.trim(),
        search_title: data.title.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        order
      };
    
      const newBlog = new Blog(newBlogData);
    
      newBlog.save((err, blog) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        blog.translations = formatTranslations(blog, 'tr');
        blog.translations = formatTranslations(blog, 'ru');

        Blog.findByIdAndUpdate(blog._id, {$set: {
          translations: blog.translations
        }}, err => {
          if (err) return callback('database_error');

          Blog.collection
            .createIndex(
              { search_title: 'text', search_subtitle: 'text' },
              { weights: {
                search_title: 10,
                search_subtitle: 1
              } }
            )
            .then(() => callback(null, blog._id.toString()))
            .catch(_ => callback('index_error'));
        });
      });
    });
  });
};

BlogSchema.statics.findBlogById = function (id, callback) {
  const Blog = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Blog.findById(mongoose.Types.ObjectId(id.toString()), (err, blog) => {
    if (err) return callback('database_error');
    if (!blog) return callback('document_not_found');

    const is_completed = isBlogComplete(blog);

    if (blog.is_completed == is_completed)
      return callback(null, blog);

    Blog.findByIdAndUpdate(blog._id, {$set: {
      is_completed
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

BlogSchema.statics.findBlogByIdAndUpdate = function (id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (blog.is_deleted) return callback('not_authenticated_request');

    if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.title);
    const oldIdentifier = toURLString(blog.title);

    Blog.findOne({
      _id: { $ne: blog._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = blog.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(blog.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = blog.identifier_languages[key]
      });

      Project.findProjectById(data.project_id, (project_err, project) => {
        Writer.findWriterById(data.writer_id, (writer_err, writer) => {
          Blog.findByIdAndUpdate(blog._id, {$set: {
            title: data.title.trim(),
            identifiers,
            identifier_languages,
            subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : blog.subtitle,
            type: data.type && TYPE_VALUES.includes(data.type) ? data.type : blog.type,
            project_id: data.type == 'project' && !project_err ? project._id : blog.project_id,
            writer_id: !writer_err ? writer._id : blog.writer_id,
            social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
          }}, { new: true }, (err, blog) => {
            if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
              return callback('duplicated_unique_field');
            if (err) return callback('database_error');
    
            blog.translations = formatTranslations(blog, 'tr', blog.translations.tr);
            blog.translations = formatTranslations(blog, 'ru', blog.translations.ru);
      
            Blog.findByIdAndUpdate(blog._id, {$set: {
              translations: blog.translations
            }}, { new: true }, (err, blog) => {
              if (err) return callback('database_error');
    
              const searchTitle = new Set();
              const searchSubtitle = new Set();

              blog.title.split(' ').forEach(word => searchTitle.add(word));
              blog.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
              blog.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
              blog.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
              blog.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
              blog.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));

              Blog.findByIdAndUpdate(blog._id, {$set: {
                search_title: Array.from(searchTitle).join(' '),
                search_subtitle: Array.from(searchSubtitle).join(' ')
              }}, err => {
                if (err) return callback('database_error');

                Blog.collection
                  .createIndex(
                    { search_title: 'text', search_subtitle: 'text' },
                    { weights: {
                      search_title: 10,
                      search_subtitle: 1
                    } }
                  )
                  .then(() => callback(null))
                  .catch(_ => callback('index_error'));
              });
            });
          });
        });
      });
    });
  });
};

BlogSchema.statics.findBlogByIdAndUpdateImage = function (id, file, callback) {
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
      }}, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!blog.image || blog.image.split('/')[blog.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(blog.image, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

BlogSchema.statics.findBlogByIdAndUpdateTranslations = function (id, data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    if (!blog.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(blog, data.language, data);
    let oldIdentifier = toURLString(blog.translations[data.language]?.title);
    const newIdentifier = toURLString(translations[data.language].title);

    if (oldIdentifier == toURLString(blog.title))
      oldIdentifier = null;

    Blog.findOne({
      _id: { $ne: blog._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = blog.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(blog.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = blog.identifier_languages[key]
      });
  
      Blog.findByIdAndUpdate(blog._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, (err, blog) => {
        if (err) return callback('database_error');
  
        const searchTitle = new Set();
        const searchSubtitle = new Set();

        blog.title.split(' ').forEach(word => searchTitle.add(word));
        blog.translations.tr.title.split(' ').forEach(word => searchTitle.add(word));
        blog.translations.ru.title.split(' ').forEach(word => searchTitle.add(word));
        blog.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        blog.translations.tr.subtitle.split(' ').forEach(word => searchSubtitle.add(word));
        blog.translations.ru.subtitle.split(' ').forEach(word => searchSubtitle.add(word));

        Blog.findByIdAndUpdate(blog._id, {$set: {
          search_title: Array.from(searchTitle).join(' '),
          search_subtitle: Array.from(searchSubtitle).join(' ')
        }}, err => {
          if (err) return callback('database_error');

          Blog.collection
            .createIndex(
              { search_title: 'text', search_subtitle: 'text' },
              { weights: {
                search_title: 10,
                search_subtitle: 1
              } }
            )
            .then(() => callback(null))
            .catch(_ => callback('index_error'));
        });
      });
    });
  });
};

BlogSchema.statics.findBlogsByFilters = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Blog
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(blogs => async.timesSeries(
        blogs.length,
        (time, next) => Blog.findBlogByIdAndFormat(blogs[time]._id, (err, blog) => next(err, blog)),
        (err, blogs) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            blogs
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Blog
      .find(filters)
      .sort({
        score: { $meta: 'textScore' }, 
        order: -1
      })
      .limit(limit)
      .skip(skip)
      .then(blogs => async.timesSeries(
        blogs.length,
        (time, next) => Blog.findBlogByIdAndFormat(blogs[time]._id, (err, blog) => next(err, blog)),
        (err, blogs) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            blogs
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

BlogSchema.statics.findBlogCountByFilters = function (data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Blog
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Blog
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

BlogSchema.statics.findBlogByIdAndDelete = function (id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (blog.is_deleted) return callback(null);

    Blog.findByIdAndUpdate(blog._id, {$set: {
      title: blog.title + blog._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      Blog.find({
        order: { $gt: blog.order }
      }, (err, blogs) => {
        if (err) return callback('database_error');

        async.timesSeries(
          blogs.length,
          (time, next) => Blog.findByIdAndUpdate(blogs[time]._id, {$inc: {
            order: -1
          }}, err => next(err)),
          err => {
            if (err) return callback('database_error');

            return callback(null);
          }
        );
      });
    });
  });
};

BlogSchema.statics.findBlogByIdAndRestore = function (id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (!blog.is_deleted) return callback(null);

    identifiers = [ toURLString(blog.title.replace(blog._id.toString(), '')) ];
    const identifierLanguages = {
      [identifiers[0]]: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.values(blog.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.title);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(blog.translations)[index]; 
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Blog.findOne({ identifiers: identifiers[time] }, (err, blog) => {
        if (err) return next('database_error');
        if (blog) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Blog.findBlogCountByFilters({ is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Blog.findByIdAndUpdate(blog._id, {
            title: blog.title.replace(blog._id.toString(), ''),
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

BlogSchema.statics.findBlogByIdAndIncOrderByOne = function (id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (blog.is_deleted) return callback('not_authenticated_request');

    Blog.findOne({
      order: blog.order + 1
    }, (err, prev_blog) => {
      if (err) return callback('database_error');
      if (!prev_blog)
        return callback(null);

      Blog.findByIdAndUpdate(blog._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Blog.findByIdAndUpdate(prev_blog._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

BlogSchema.statics.findBlogByIdAndCreateWriting = function (id, data, callback) {
  const Blog = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);
    if (!blog.is_completed)
      return callback('not_authenticated_request');

    Writing.createWritingByParentId(blog._id, {
      type: 'blog',
      parent_id: blog._id,
      title: data.title,
      writer_id: blog.writer_id
    }, (err, writing_id) => {
      if (err) return callback(err);

      return callback(null, writing_id);
    });
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingById = function (id, writing_id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentId(
      writing_id,
      blog._id,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndFormat = function (id, writing_id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndFormat(
      writing_id,
      blog._id,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndFormatByLanguage = function (id, writing_id, language, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndFormatByLanguage(
      writing_id,
      blog._id,
      language,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndUpdate = function (id, writing_id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdate(
      writing_id,
      blog._id,
      data,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndUpdateTranslations = function (id, writing_id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdateTranslations(
      writing_id,
      blog._id,
      data,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndUpdateLogo = function (id, writing_id, file, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndAndParentIdUpdateLogo(
      writing_id,
      blog._id,
      file,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndUpdateCover = function (id, writing_id, file, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndAndParentIdUpdateCover(
      writing_id,
      blog._id,
      file,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingsByFilters = function (id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingsByParentIdAndFilters(
      blog._id,
      data,
      (err, data) => callback(err, data)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingCountByFilters = function (id, data, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingCountByParentIdAndFilters(
      blog._id,
      data,
      (err, count) => callback(err, count)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndDelete = function (id, writing_id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndDelete(
      writing_id,
      blog._id,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndRestore = function (id, writing_id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndRestore(
      writing_id,
      blog._id,
      (err, writing) => callback(err, writing)
    );
  });
};

BlogSchema.statics.findBlogByIdAndGetWritingByIdAndIncOrderByOne = function (id, writing_id, callback) {
  const Blog = this;

  Blog.findBlogById(id, (err, blog) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndIncOrderByOne(
      writing_id,
      blog._id,
      (err, writing) => callback(err, writing)
    );
  });
};

module.exports = mongoose.model('Blog', BlogSchema);
