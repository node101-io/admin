const Writer = require('../../writer/Writer');

const getChapter = (chapter, callback) => {
  if (!chapter || !chapter._id)
    return callback('bad_request');

  if (chapter.writer_id) {
    Writer.findWriterById(chapter.writer_id, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: chapter._id.toString(),
        is_completed: chapter.is_completed,
        title: chapter.title,
        translations: chapter.translations,
        writer,
      });
    });
  } else {
    return callback(null, {
      _id: chapter._id.toString(),
      is_completed: chapter.is_completed,
      title: chapter.title,
      translations: chapter.translations,
      writer_id: chapter.writer_id,
    });
  }
};

module.exports = getChapter;