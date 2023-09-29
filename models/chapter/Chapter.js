const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const toURLString = require('../../utils/toURLString');

const Writer = require('../writer/Writer');
const Writing = require('../writing/Writing');

const formatTranslations = require('./functions/formatTranslations');
const getChapter = require('./functions/getChapter');

const CHILDREN_TYPE_VALUES = ['chapter', 'writing'];
const DEFAULT_DOCUMENT_COUNT_PER_QUERY = 1e3;
const DEFAULT_LANGUAGE = 'en';
const MAX_CHILDREN_COUNT = 1e3;
const MAX_DOCUMENT_COUNT_PER_QUERY = 1e3;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

const Schema = mongoose.Schema;

const ChapterSchema = new Schema({
  parent_id: { // This is the ID of the book or chapter holding this document. Order is determined from the array
    type: mongoose.Types.ObjectId,
    required: true
  },
  writer_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 0,
    maxlenght: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  identifiers: {
    type: Array,
    default: []
  },
  identifier_languages: {
    type: Object,
    default: {}
  },
  translations: {
    type: Object,
    default: {}
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

  if (!data.parent_id || !validator.isMongoId(data.parent_id.toString()))
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  const identifier = toURLString(data.title);

  Writer.findWriterById(data.writer_id, (err, writer) => {
    if (err) return callback(err);

    const newChapterData = {
      parent_id: mongoose.Types.ObjectId(data.parent_id.toString()),
      writer_id: writer._id,
      title: data.title.trim(),
      identifiers: [ identifier ],
      identifier_languages: { [identifier]: DEFAULT_LANGUAGE },
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
  
        return callback(null, chapter._id);
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

ChapterSchema.statics.findChapterByIdAndGetChildrenByFilters = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  const limit = data.limit && !isNaN(parseInt(data.limit)) && parseInt(data.limit) > 0 && parseInt(data.limit) < MAX_DOCUMENT_COUNT_PER_QUERY ? parseInt(data.limit) : DEFAULT_DOCUMENT_COUNT_PER_QUERY;
  const page = data.page && !isNaN(parseInt(data.page)) && parseInt(data.page) > 0 ? parseInt(data.page) : 0;
  const skip = page * limit;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    async.timesSeries(
      Math.min(limit, chapter.children.length - skip),
      (time, next) => {
        const child = chapter.children[skip + time];

        if (child.type == 'chapter')
          Chapter.findChapterByIdAndFormat(child._id, (err, chapter) => {
            if (err) return next(err);

            return next(null, {
              _id: chapter._id,
              is_completed: chapter.is_completed,
              is_deleted: chapter.is_deleted,
              type: 'chapter',
              title: chapter.title,
            });
          });
        else
          Writing.findWritingByIdAndParentIdAndFormat(child._id, chapter._id, (err, writing) => {
            if (err) return next(err);

            return next(null, {
              _id: writing._id,
              is_completed: writing.is_completed,
              is_deleted: writing.is_deleted,
              type: 'writing',
              title: writing.title
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

ChapterSchema.statics.findChapterByIdAndCreateChapter = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Chapter.findChapterById(id, (err, parent) => {
    if (err) return callback(err);

    Chapter.createChapter({
      parent_id: parent._id,
      writer_id: parent.writer_id,
      title: data.title
    }, (err, chapter_id) => {
      if (err) return callback(err);

      Chapter.findByIdAndUpdate(parent._id, {$push: {
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

ChapterSchema.statics.findChapterByIdAndCreateWriting = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  Chapter.findChapterById(id, (err, parent) => {
    if (err) return callback(err);

    Writing.createWritingByParentId(parent._id, {
      type: 'book',
      title: data.title,
      writer_id: parent.writer_id
    }, (err, writing_id) => {
      if (err) return callback(err);

      Chapter.findByIdAndUpdate(parent._id, {$push: {
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

ChapterSchema.statics.findChapterByIdAndUpdate = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.title || typeof data.title != 'string' || !data.title.trim().length || data.title.trim().length > MAX_DATABASE_TEXT_FIELD_LENGTH)
    return callback('bad_request');

  if (!data.writer_id || !validator.isMongoId(data.writer_id.toString()))
    return callback('bad_request');

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    const newIdentifier = toURLString(data.title);
    const oldIdentifier = toURLString(chapter.title);

    Chapter.findOne({
      _id: { $ne: chapter._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = chapter.identifiers.filter(each => each != oldIdentifier).concat(newIdentifier);

      const identifier_languages = {
        identifier: DEFAULT_LANGUAGE
      };

      Object.keys(chapter.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = chapter.identifier_languages[key]
      });

      Writer.findWriterById(data.writer_id, (err, writer) => {
        if (err) return callback(err);

        Chapter.findByIdAndUpdate(chapter._id, {$set: {
          writer_id: writer._id,
          title: data.title.trim(),
          identifiers,
          identifier_languages
        }}, err => {
          if (err) return callback('database_error');

          return callback(null);
        })
      });
    });
  });
};

ChapterSchema.statics.findChapterByIdAndUpdateTranslations = function (id, data, callback) {
  const Chapter = this;

  if (!data || typeof data != 'object')
    return callback('bad_request');

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return callback('bad_request');

  Chapter.findChapterByIdAndParentId(id, parent_id, (err, chapter) => {
    if (err) return callback(err);

    const translations = formatTranslations(chapter, data.language, data);
    let oldIdentifier = toURLString(chapter.translations[data.language]?.title);
    const newIdentifier = toURLString(translations[data.language].title);

    if (oldIdentifier == toURLString(chapter.title))
      oldIdentifier = null;

    Chapter.findOne({
      _id: { $ne: chapter._id },
      identifiers: newIdentifier
    }, (err, duplicate) => {
      if (err) return callback('database_error');
      if (duplicate) return callback('duplicated_unique_field');

      const identifiers = chapter.identifiers.filter(each => each != oldIdentifier);
      if (!identifiers.includes(newIdentifier))
        identifiers.push(newIdentifier);
      const identifier_languages = {
        [newIdentifier]: data.language
      };
  
      Object.keys(chapter.identifier_languages).forEach(key => {
        if (key != oldIdentifier)
          identifier_languages[key] = chapter.identifier_languages[key]
      });
  
      Chapter.findByIdAndUpdate(chapter._id, {$set: {
        identifiers,
        identifier_languages,
        translations
      }}, { new: true }, err => {
        if (err) return callback('database_error');
  
        return callback(null);
      });
    });
  });
};

ChapterSchema.statics.findChapterChildByIdAndParentIdAndIncOrderByOne = function (id, parent_id, callback) {
  const Chapter = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Chapter.findChapterById(parent_id, (err, parent) => {
    if (err) return callback(err);

    const index = parent.children.indexOf(each => each._id == id.toString());

    if (index < 0) return callback('document_not_found');
    if (index == 0) return callback(null);

    let newChildren = parent.children;
    newChildren.splice(index, 2, newChildren[index], newChildren[index - 1]);

    Chapter.findByIdAndUpdate(parent._id, {$set: {
      children: newChildren
    }}, err => {
      if (err) return callback('database_error');

      return callback(null);
    });
  });
};

ChapterSchema.statics.findChapterChildByIdAndParentIdAndMoveToSameLevelWithParent = function (id, parent_id, callback) {
  const Chapter = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Chapter.findChapterById(parent_id, (err, parent) => {
    if (err) return callback(err);

    const child = parent.children.find(each => each._id == id.toString());

    if (!child) return callback('document_not_found');

    Chapter.findChapterById(parent.parent_id, (err, grand_parent) => {
      if (err) return callback(err);

      Chapter.findByIdAndUpdate(parent._id, {$pull: {
        children: child
      }}, err => {
        if (err) return callback('database_error');

        Chapter.findChapterById(grand_parent._id, {$push: {
          children: child
        }}, err => {
          if (err) return callback('database_error');

          if (child.type == 'chapter')
            return callback(null);

          Writing.findWritingByIdAndUpdateParentId(child._id, grand_parent._id, err => {
            if (err) return callback(err);

            return callback(null);
          });
        });
      });
    });
  });
};

ChapterSchema.statics.findChapterByIdAndDelete = function (id, callback) {
  const Chapter = this;

  Chapter.findChapterById(id, (err, chapter) => {
    if (err) return callback(err);

    async.timesSeries(
      chapter.children.length,
      (time, next) => {
        const child = chapter.children[time];

        if (child.type == 'chapter')
          Chapter.findChapterByIdAndDelete(child._id, err => next(err));
        else
          Writing.findWritingByIdAndForceDelete(child._id, err => next(err));
      },
      err => {
        if (err) return callback(err);

        Chapter.findByIdAndDelete(chapter._id, err => {
          if (err) return callback('database_error');

          return callback(null);
        });
      }
    );
  });
};

module.exports = mongoose.model('Chapter', ChapterSchema);