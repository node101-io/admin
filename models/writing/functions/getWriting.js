const Blog = require('../blog/Blog');
const Book = require('../book/Book');
const Guide = require('../guide/Guide');
const Writer = require('../../writer/Writer');

const formatTypeClass = require('./formatTypeClass');

module.exports = (writing, callback) => {
  const typeClass = formatTypeClass(data.type);

  [typeClass][`find${typeClass}ByIdAndFormat`](writing.parent_id, (err, parent) => {
    if (err) return callback(err);

    Writer.findWriterByIdAndFormat(writing.writer_id, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: writing._id.toString(),
        title: writing.title,
        identifier: writing.identifiers[0],
        [typeClass]: parent,
        writer,
        cover: writing.cover,
        content: writing.content,
        translations: writing.translations
      });
    });
  });
};
