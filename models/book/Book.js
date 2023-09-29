const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const deleteFile = require('../../utils/deleteFile');
const toURLString =require('../../utils/toURLString');

const Chapter = require('../chapter/Chapter');
const Image = require('../image/Image');
const Project = require('../project/Project');
const Writing = require('../writing/Writing');
const Writer = require('../writer/Writer');

const formatTranslations = require('./functions/formatTranslations');
const getBook = require('./functions/getBook');
const getBookByLanguage = require('./functions/getBookByLanguage');
const getSocialMediaAccounts = require('./functions/getSocialMediaAccounts');
const isBookComplete = require('./functions/isBookComplete');

const CHILDREN_TYPE_VALUES = ['chapter', 'writing'];
const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const IMAGE_HEIGHT = 300;
const IMAGE_WIDTH = 300;
const IMAGE_NAME_PREFIX = 'node101 book ';
const MAX_CHILDREN_COUNT = 1e3;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e2;

const Schema = mongoose.Schema;

const BookSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
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
  created_at: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  image: {
    type: String,
    default: null,
    minlength: 1,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  project_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  writer_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  is_completed: {
    type: Boolean,
    default: false
  },
  social_media_accounts: {
    type: Object,
    default: false
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
    min: 0
  },
  children: {
    type: Array,
    default: [],
    maxlength: MAX_CHILDREN_COUNT
    /*
      Format: [{
        _id: mongoose.Types.ObjectId,
        type: String
      }]
    */
  }
});

BookSchema.statics.createBook = function (data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.name);

  Book.findOne({
    identifiers: identifier
  }, (err, book) => {
    if (err) return callback('database_error');
    if (book) return callback('duplicated_unique_field');

    Book.findBookCountByFilters({ is_deleted: false }, (err, order) => {
      if (err) return callback(err);

      const newBookData = {
        name: data.name.trim(),
        identifiers: [ identifier ],
        identifier_languages: { [identifier]: DEFAULT_IDENTIFIER_LANGUAGE },
        created_at: new Date(),
        order
      };
    
      const newBook = new Book(newBookData);
    
      newBook.save((err, book) => {
        if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
          return callback('duplicated_unique_field');
        if (err) return callback('database_error');

        book.translations = formatTranslations(book, 'tr');
        book.translations = formatTranslations(book, 'ru');

        Book.findByIdAndUpdate(book._id, {$set: {
          translations: book.translations
        }}, err => {
          if (err) return callback('database_error');

          return callback(null, book._id.toString());
        });
      });
    });
  });
};

BookSchema.statics.findBookById = function (id, callback) {
  const Book = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Book.findById(mongoose.Types.ObjectId(id.toString()), (err, book) => {
    if (err) return callback('database_error');
    if (!book) return callback('document_not_found');

    const is_completed = isBookComplete(book);

    if (book.is_completed == is_completed)
      return callback(null, book);

    Book.findByIdAndUpdate(book._id, {$set: {
      is_completed
    }}, { new: true }, (err, book) => {
      if (err) return callback('database_error');

      return callback(null, book);
    });
  });
};

BookSchema.statics.findBookByIdAndFormat = function (id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    getBook(book, (err, book) => {
      if (err) return callback(err);

      return callback(null, book);
    });
  });
};

BookSchema.statics.findBookByIdAndFormatByLanguage = function (id, language, callback) {
  const Book = this;

  if (!language || !validator.isISO31661Alpha2(language.toString()))
    return callback('bad_request');

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (!book.is_completed)
      return callback('not_authenticated_request');

    getBookByLanguage(book, language, (err, book) => {
      if (err) return callback(err);

      return callback(null, book);
    });
  });
};

BookSchema.statics.findBookByIdAndUpdate = function (id, data, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (book.is_deleted) return callback('not_authenticated_request');

    if (!data.name || typeof data.name != 'string' || !data.name.trim().length || data.name.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
      return callback('bad_request');

    const newIdentifier = toURLString(data.name);
    const oldIdentifier = toURLString(book.name);

    Book.findOne({
      _id: { $ne: book._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = book.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        [newIdentifier]: DEFAULT_IDENTIFIER_LANGUAGE
      };

      Object.keys(book.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = book.identifier_languages[key]
      });

      Writer.findWriterById(data.writer_id, (err, writer) => {
        if (err) return callback(err);

        Book.findByIdAndUpdate(book._id, {$set: {
          name: data.name.trim(),
          identifiers,
          identifier_languages,
          description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : book.description,
          writer_id: writer._id,
          social_media_accounts: getSocialMediaAccounts(data.social_media_accounts)
        }}, { new: true }, (err, book) => {
          if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
            return callback('duplicated_unique_field');
          if (err) return callback('database_error');
  
          book.translations = formatTranslations(book, 'tr', book.translations.tr);
          book.translations = formatTranslations(book, 'ru', book.translations.ru);
    
          Book.findByIdAndUpdate(book._id, {$set: {
            translations: book.translations
          }}, { new: true }, (err, book) => {
            if (err) return callback('database_error');
  
            const searchName = new Set();
            const searchDescription = new Set();
  
            book.name.split(' ').forEach(word => searchName.add(word));
            book.translations.tr.name.split(' ').forEach(word => searchName.add(word));
            book.translations.ru.name.split(' ').forEach(word => searchName.add(word));
            book.description.split(' ').forEach(word => searchDescription.add(word));
            book.translations.tr.description.split(' ').forEach(word => searchDescription.add(word));
            book.translations.ru.description.split(' ').forEach(word => searchDescription.add(word));
  
            Book.findByIdAndUpdate(book._id, {$set: {
              search_name: Array.from(searchName).join(' '),
              search_description: Array.from(searchDescription).join(' ')
            }}, err => {
              if (err) return callback('database_error');
  
              Project.findProjectById(data.project_id, (project_err, project) => {
                Book.findByIdAndUpdate(book._id, {$set: {
                  project_id: !project_err ? project._id : book.project_id
                }}, err => {
                  if (err) return callback('database_error');

                  return callback(null);
                });
              });
            });
          });
        });
      });
    });
  });
};

BookSchema.statics.findBookByIdAndUpdateImage = function (id, file, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (book.is_deleted) return callback('not_authenticated_request');

    Image.createImage({
      file_name: file.filename,
      original_name: IMAGE_NAME_PREFIX + book.name,
      width: IMAGE_WIDTH,
      height: IMAGE_HEIGHT,
      is_used: true
    }, (err, url) => {
      if (err) return callback(err);
  
      Book.findByIdAndUpdate(book._id, { $set: {
        image: url
      }}, err => {
        if (err) return callback(err);

        deleteFile(file, err => {
          if (err) return callback(err);

          if (!book.image || book.image.split('/')[book.image.split('/').length-1] == url.split('/')[url.split('/').length-1])
            return callback(null, url);

          Image.findImageByUrlAndDelete(book.image, err => {
            if (err) return callback(err);

            return callback(null, url);
          });
        });
      });
    });
  });
};

BookSchema.statics.findBookByIdAndUpdateTranslations = function (id, data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    if (!book.is_completed)
      return callback('not_authenticated_request');

    const translations = formatTranslations(book, data.language, data);
    let oldIdentifier = toURLString(book.translations[data.language]?.name);
    const newIdentifier = toURLString(translations[data.language].name);

    if (oldIdentifier == toURLString(book.name))
      oldIdentifier = null;

    Book.findOne({
      _id: { $ne: book._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = book.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(book.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = book.identifier_languages[key]
      });
  
      Book.findByIdAndUpdate(book._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, (err, book) => {
        if (err) return callback('database_error');
  
        const searchName = new Set();
        const searchDescription = new Set();

        book.name.split(' ').forEach(word => searchName.add(word));
        book.translations.tr.name.split(' ').forEach(word => searchName.add(word));
        book.translations.ru.name.split(' ').forEach(word => searchName.add(word));
        book.description.split(' ').forEach(word => searchDescription.add(word));
        book.translations.tr.description.split(' ').forEach(word => searchDescription.add(word));
        book.translations.ru.description.split(' ').forEach(word => searchDescription.add(word));

        Book.findByIdAndUpdate(book._id, {$set: {
          search_name: Array.from(searchName).join(' '),
          search_description: Array.from(searchDescription).join(' ')
        }}, err => {
          if (err) return callback('database_error');

          Book.collection
            .createIndex(
              { search_name: 'text', search_description: 'text' },
              { weights: {
                search_name: 10,
                search_description: 1
              } }
            )
            .then(() => callback(null))
            .catch(_ => callback('index_error'));
        });
      });
    });
  });
};

BookSchema.statics.findBooksByFilters = function (data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Book
      .find(filters)
      .sort({ order: -1 })
      .limit(limit)
      .skip(skip)
      .then(books => async.timesSeries(
        books.length,
        (time, next) => Book.findBookByIdAndFormat(books[time]._id, (err, book) => next(err, book)),
        (err, books) => {
          if (err) return callback(err);

          return callback(null, {
            search: null,
            limit,
            page,
            books
          });
        })
      )
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Book
      .find(filters)
      .sort({
        score: { $meta: 'textScore' }, 
        order: -1
      })
      .limit(limit)
      .skip(skip)
      .then(books => async.timesSeries(
        books.length,
        (time, next) => Book.findBookByIdAndFormat(books[time]._id, (err, book) => next(err, book)),
        (err, books) => {
          if (err) return callback(err);

          return callback(null, {
            search: data.search.trim(),
            limit,
            page,
            books
          });
        })
      )
      .catch(_ => callback('database_error'));
  };
};

BookSchema.statics.findBookCountByFilters = function (data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if ('is_deleted' in data)
    filters.is_deleted = data.is_deleted ? true : false;

  if (data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.name = { $regex: data.name.trim(), $options: 'i' };

  if (!data.search || typeof data.search != 'string' || !data.search.trim().length) {
    Book
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  } else {
    filters.$text = { $search: data.search.trim() };

    Book
      .find(filters)
      .countDocuments()
      .then(count => callback(null, count))
      .catch(_ => callback('database_error'));
  };
};

BookSchema.statics.findBookByIdAndDelete = function (id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (book.is_deleted) return callback(null);

    Book.findByIdAndUpdate(book._id, {$set: {
      name: book.name + book._id.toString(),
      identifiers: [],
      identifier_languages: {},
      is_deleted: true,
      order: null
    }}, err => {
      if (err) return callback('database_error');

      Book.find({
        order: { $gt: book.order }
      }, (err, books) => {
        if (err) return callback('database_error');

        async.timesSeries(
          books.length,
          (time, next) => Book.findByIdAndUpdate(books[time]._id, {$inc: {
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

BookSchema.statics.findBookByIdAndRestore = function (id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (!book.is_deleted) return callback(null);

    identifiers = [ toURLString(book.name.replace(book._id.toString(), '')) ];
    const identifierLanguages = {
      [identifiers[0]]: DEFAULT_IDENTIFIER_LANGUAGE
    };

    Object.values(book.translations).forEach((lang, index) => {
      const languageIdentifier = toURLString(lang.name);
      if (!identifiers.includes(languageIdentifier)) {
        identifiers.push(languageIdentifier);
        identifierLanguages[languageIdentifier] = Object.keys(book.translations)[index]; 
      }
    });

    async.timesSeries(
      identifiers.length,
      (time, next) => Book.findOne({ identifiers: identifiers[time] }, (err, book) => {
        if (err) return next('database_error');
        if (book) return next('duplicated_unique_field');

        return next(null);
      }),
      err => {
        if (err) return callback(err);

        Book.findBookCountByFilters({ is_deleted: false }, (err, order) => {
          if (err) return callback(err);

          Book.findByIdAndUpdate(book._id, {
            name: book.name.replace(book._id.toString(), ''),
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

BookSchema.statics.findBookByIdAndIncOrderByOne = function (id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);
    if (book.is_deleted) return callback('not_authenticated_request');

    Book.findOne({
      order: book.order + 1
    }, (err, prev_book) => {
      if (err) return callback('database_error');
      if (!prev_book)
        return callback(null);

      Book.findByIdAndUpdate(book._id, {$inc: {
        order: 1
      }}, err => {
        if (err) return callback('database_error');

        Book.findByIdAndUpdate(prev_book._id, {$inc: {
          order: -1
        }}, err => {
          if (err) return  callback('database_error');

          return callback(null);
        });
      });
    });
  });
};

BookSchema.statics.findBookByIdAndGetChildrenByFilters = function (id, data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    async.timesSeries(
      Math.min(limit, book.children.length - skip),
      (time, next) => {
        const child = book.children[skip + time];

        if (child.type == 'chapter')
          Chapter.findChapterByIdAndFormat(child._id, (err, chapter) => {
            if (err) return next(err);

            return next(null, {
              _id: chapter._id,
              type: 'chapter',
              title: chapter.title,
              is_completed: chapter.is_completed
            });
          });
        else
          Writing.findWritingByIdAndParentIdAndFormat(child._id, book._id, (err, writing) => {
            if (err) return next(err);

            return next(null, {
              _id: writing._id,
              type: 'writing',
              title: writing.title,
              is_completed: writing.is_completed
            });
          });
      },
      (err, children) => {
        if (err) return callback(err);

        return callback(null, {
          search: null,
          limit,
          page,
          children,
        });
      }
    );
  });
};

BookSchema.statics.findBookByIdAndCreateChapter = function (id, data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    if (!book.is_completed)
      return callback('bad_request');

    Chapter.createChapter({
      parent_id: book._id,
      writer_id: book.writer_id,
      title: data.title
    }, (err, chapter_id) => {
      if (err) return callback(err);

      Book.findByIdAndUpdate(book._id, {$push: {
        children: {
          _id: chapter_id.toString(),
          type: 'chapter'
        }
      }}, err => {
        if (err) return callback('database_error');
    
        return callback(null, chapter_id);
      });
    });
  });
};

BookSchema.statics.findBookByIdAndCreateWriting = function (id, data, callback) {
  const Book = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    if (!book.is_completed)
      return callback('bad_request');

    Writing.createWritingByParentId(book._id, {
      type: 'book',
      title: data.title,
      writer_id: book.writer_id
    }, (err, writing_id) => {
      if (err) return callback(err);

      Book.findByIdAndUpdate(book._id, {$push: {
        children: {
          _id: writing_id.toString(),
          type: 'writing'
        }
      }}, err => {
        if (err) return callback('database_error');

        return callback(null, writing_id);
      });
    })
  })
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndUpdate = function (id, writing_id, data, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdate(
      writing_id,
      book._id,
      data,
      (err, writing) => callback(err, writing)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndUpdateCover = function (id, writing_id, file, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdateCover(
      writing_id,
      book._id,
      file,
      (err, url) => callback(err, url)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndUpdateLogo = function (id, writing_id, file, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdUpdateLogo(
      writing_id,
      book._id,
      file,
      (err, url) => callback(err, url)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndUpdateTranslations = function (id, writing_id, data, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndUpdateTranslations(
      writing_id,
      book._id,
      data,
      (err, writing) => callback(err, writing)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndDelete = function (id, writing_id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentId(writing_id, book._id, (err, writing) => {
      Writing.deleteOne({ _id: writing._id }, err => {
        if (err) callback('database_error');
      });
    });
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndFormat = function (id, writing_id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndFormat(
      writing_id,
      book._id,
      (err, writing) => callback(err, writing)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndFormatByLanguage = function (id, writing_id, language, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndFormatByLanguage(
      writing_id,
      book._id,
      language,
      (err, writing) => callback(err, writing)
    );
  });
};

BookSchema.statics.findBookByIdAndGetWritingByIdAndIncOrderByOne = function (id, writing_id, callback) {
  const Book = this;

  Book.findBookById(id, (err, book) => {
    if (err) return callback(err);

    Writing.findWritingByIdAndParentIdAndIncOrderByOne(
      writing_id,
      book._id,
      (err, writing) => callback(err, writing)
    );
  });
};

module.exports = mongoose.model('Book', BookSchema);
