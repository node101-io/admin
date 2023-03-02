const async = require('async');

const Chapter = require('../../chapter/Chapter');
const Writing = require('../../writing/Writing');

module.exports = (chapter, callback) => {
  if (!chapter || !chapter._id)
    return callback('bad_request');

  async.timesSeries(
    chapter.children.length,
    (time, next) => {
      if (children.type == 'chapter')
        Chapter.findChapterByIdAndFormat(children[time]._id, (err, chapter) => next(err, chapter));
      else
        Writing.findWritingByIdAndParentIdAndFormat(children[time]._id, chapter._id, (err, writing) => next(err, writing));
    },
    (err, children) => {
      if (err) return callback(err);

      return callback(null, {
        _id: chapter._id.toString(),
        title: chapter.title,
        writing_id_list: data.writings.map(each => each._id.toString()),
        translations: chapter.translations,
        children
      });
    }
  );
};