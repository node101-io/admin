const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Book = require('../book/Book');
const Writing = require('../writing/Writing');

const formatTranslations = require('./functions/formatTranslations');
const getChapter = require('./functions/getChapter');

const CHILDREN_TYPE_VALUES = ['chapter', 'writing'];
const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 1e3;
const MAX_CHILDREN_COUNT = 1e3;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e3;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  book_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  parent_id: {
    type: mongoose.Types.ObjectId,
    default: null // If null, this is a root chapter.
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 0,
    maxlenght: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  translations: {
    type: Object,
    default: {}
  },
  order: { // Not as same as other models, only valid for root chapters
    type: Number,
    default: null
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

ChapterSchema.statics.createChapter = function (data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Book.findBookById(data.book_id, (err, book) => {
    if (err) return callback(err);
    if (!book.is_completed)
      return callback('not_authenticated_request');

    Chapter.findChapterCountByFilters({
      book_id: book._id,
      is_root: true
    }, (err, order) => {
      if (err) return callback(err);

      const newChapterData = {
        book_id: book._id,
        parent_id: null,
        title: data.title.trim(),
        order
      };
  
      const newChapter = new Chapter(newChapterData);
  
      newChapter.save((err, chapter) => {
        if (err) return callback('database_error');

        chapter.translations = formatTranslations(chapter, 'tr');
        chapter.translations = formatTranslations(chapter, 'ru');

        Chapter.findByIdAndUpdate(chapter._id, {$set: {
          translations: chapter.translations
        }}, err => {
          if (err) return callback('database_error');

          // Book.

          return callback(null, chapter._id);
        });
      });
    });
  });
};

ChapterSchema.statics.findChapterById = function (id, callback) {
  const Chapter = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Chapter.findById(mongoose.Types.ObjectId(id.toString()), (err, chapter) => {
    if (err) return callback('database_error');
    if (!chapter) return callback('document_not_found');

    return callback(null, chapter);
  });
};

ChapterSchema.statics.findChapterByIdAndFormat = function (id, callback) {
  const Chapter = this;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    getChapter(chapter, (err, chapter) => {
      if (err) return callback(err);

      return callback(null, chapter);
    });
  });
};

ChapterSchema.statics.findChapterByIdAndGetChildren = function (id, callback) {
  const Chapter = this;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    async.timesSeries(
      chapter.children.length,
      (time, next) => {
        const child = chapter.children[time];

        if (child.type == 'chapter')
          Chapter.findChapterByIdAndFormat(child._id, (err, chapter) => next(err, chapter));
        else
          Writing.findWritingByIdAndFormat(child._id, (err, writing) => next(err, writing));
      },
      (err, children) => {
        if (err) return callback(err);

        return callback(null, children.reverse());
      }
    );
  });
};

ChapterSchema.statics.findChaptersByFilters = function (data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  if (data.book_id && validator.isMongoId(data.book_id.toString()))
    filters.book_id == mongoose.Types.ObjectId(data.book_id.toString());

  if ('is_root' in data)
    filters.parent_id = data.is_root ? null : { $ne: null };

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = { $regex: data.title.trim(), $options: 'i' };

  Chapter
    .find(filters)
    .sort({ order: -1 })
    .limit(limit)
    .skip(skip)
    .then(chapters => async.timesSeries(
      chapters.length,
      (time, next) => Chapter.findChapterByIdAndFormat(chapters[time]._id, (err, chapter) => next(err, chapter)),
      (err, chapters) => {
        if (err) return callback(err);

        return callback(null, {
          search: null,
          limit,
          page,
          chapters
        });
      }
    ))
    .catch(err => callback('database_error'));
};

ChapterSchema.statics.findChapterCountByFilters = function (data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const filters = {};

  if (data.book_id && validator.isMongoId(data.book_id.toString()))
    filters.book_id == mongoose.Types.ObjectId(data.book_id.toString());

  if ('is_root' in data)
    filters.parent_id = data.is_root ? null : { $ne: null };

  if (data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    filters.title = { $regex: data.title.trim(), $options: 'i' };

  Chapter
    .find(filters)
    .countDocuments()
    .then(count => callback(null, count))
    .catch(_ => callback('database_error'));
};

ChapterSchema.statics.findChapterByIdAndCreateChapter = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Chapter.findChapterById(id, (err, parent) => {
    if (err) return callback(err);

    const newChapterData = {
      book_id: parent.book_id,
      parent_id: parent._id,
      title: data.title.trim()
    };

    const newChapter = new Chapter(newChapterData);
  
    newChapter.save((err, chapter) => {
      if (err) return callback('database_error');

      chapter.translations = formatTranslations(chapter, 'tr');
      chapter.translations = formatTranslations(chapter, 'ru');

      Chapter.findByIdAndUpdate(chapter._id, {$set: {
        translations: chapter.translations
      }}, err => {
        if (err) return callback('database_error');

        Chapter.findByIdAndUpdate(parent._id, {$push: {
          children: {
            _id: chapter._id,
            type: 'chapter'
          }
        }}, err => {
          if (err) return callback('database_error');

          return callback(null, chapter._id);
        });
      });
    });
  })
};

ChapterSchema.statics.findChapterByIdAndCreateWriting = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  Chapter.findChapterById(id, (err, parent) => {
    if (err) return callback(err);

    Book.findBookById(parent.book_id, (err, book) => {
      if (err) return callback(err);

      Writing.createWritingByParentId(parent._id, {
        type: 'book',
        title: data.title,
        writer_id: book.writer_id
      }, (err, writing) => {
        if (err) return callback(err);

        Chapter.findByIdAndUpdate(parent._id, {$push: {
          children: {
            _id: writing._id,
            type: 'writing'
          }
        }}, err => {
          if (err) return callback('database_error');

          return callback(null, chapter._id);
        });
      })
    })
  })
};

ChapterSchema.statics.findChapterByIdAndUpdate = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    Chapter.findByIdAndUpdate(chapter._id, {$set: {
      // title: 
    }})
  })
};

ChapterSchema.statics.findChapterByIdAndUpdateTranslations = function (id, data, callback) {

};

ChapterSchema.statics.findChapterChildByIdAndIncOrderByOne = function (id, callback) {
  const Chapter = this;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err && err != 'document_not_found') return callback(err);

    if (err || !chapter) {
      Writing.findWritingById(id, (err, writing) => {
        if (err) return callback(err);

        Chapter.findOne({ children: {
          _id: writing._id,
          type: 'writing'
        } }, (err, parent) => {
          if (err) return callback('database_error');
          if (!parent) return callback('document_not_found');

          const index = parent.children.indexOf({
            _id: writing._id,
            type: 'writing'
          });

          if (index <= 0) return callback(null);

          let newChildren = parent.children;
          newChildren.splice(index, 2, newChildren[index], newChildren[index - 1]);

          Chapter.findByIdAndUpdate(parent._id, {$set: {
            children: newChildren
          }}, err => {
            if (err) return callback('database_error');

            return callback(null);
          });
        });
      });
    } else {
      Chapter.findChapterById(chapter.parent_id, (err, parent) => {
        if (err) return callback('database_error');
        if (!parent) return callback('document_not_found');

        const index = parent.children.indexOf({
          _id: chapter._id,
          type: 'chapter'
        });

        if (index <= 0) return callback(null);

        let newChildren = parent.children;
        newChildren.splice(index, 2, newChildren[index], newChildren[index - 1]);

        Chapter.findByIdAndUpdate(parent._id, {$set: {
          children: newChildren
        }}, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      });
    }
  })
};

ChapterSchema.statics.findChapterChildByIdAndMoveToSameLevelWithParent = function (id, callback) {
  const Chapter = this;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err && err != 'document_not_found') return callback(err);

    if (err || !chapter) {
      Writing.findWritingById(id, (err, writing) => {
        if (err) return callback(err);

        Chapter.findOne({ children: {
          _id: writing._id,
          type: 'writing'
        } }, (err, parent) => {
          if (err) return callback('database_error');
          if (!parent) return callback('document_not_found');

          Chapter.findByIdAndUpdate(parent._id, {$pull: {
            children: {
              _id: writing._id,
              type: 'writing'
            }
          }}, err => {
            if (err) return callback('database_error');

            if (parent.parent_id) {
              Chapter.findByIdAndUpdate(parent.parent_id, {$push: {
                children: {
                  _id: writing._id,
                  type: 'writing'
                }
              }}, err => {
                if (err) return callback('database_error');

                return callback(null);
              });
            } else {
              Book.findBookByIdAndPushChildren(parent.book_id, {$push: {
                children: {
                  _id: writing._id,
                  type: 'writing'
                }
              }}, err => {
                if (err) return callback('database_error');

                return callback(null);
              });
            };
          });
        });
      });
    } else {
      Chapter.findChapterById(chapter.parent_id, (err, parent) => {
        if (err) return callback('database_error');
        if (!parent) return callback('document_not_found');

        Chapter.findByIdAndUpdate(parent._id, {$pull: {
          children: {
            _id: chapter._id,
            type: 'chapter'
          }
        }}, err => {
          if (err) return callback('database_error');

          Chapter.findByIdAndUpdate(chapter._id, {$set: {
            parent_id: parent.parent_id
          }}, err => {
            if (err) return callback('database_error');

            if (parent.parent_id) {
              Chapter.findByIdAndUpdate(parent.parent_id, {$push: {
                children: {
                  _id: chapter._id,
                  type: 'chapter'
                }
              }}, err => {
                if (err) return callback('database_error');
  
                return callback(null);
              });
            } else {
              Book.findBookByIdAndPushChildren(parent.book_id, {$push: {
                children: {
                  _id: chapter._id,
                  type: 'chapter'
                }
              }}, err => {
                if (err) return callback('database_error');
  
                return callback(null);
              });
            };
          });
        });
      });
    }
  });
};

ChapterSchema.statics.findChapterByIdAndDelete = function (id, callback) {

};

module.exports = mongoose.model('Chapter', ChapterSchema);