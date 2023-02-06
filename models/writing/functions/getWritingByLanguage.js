const Blog = require('../blog/Blog');
const Book = require('../book/Book');
const Guide = require('../guide/Guide');
const Writer = require('../../writer/Writer');

const formatTypeClass = require('./formatTypeClass');

module.exports = (writing, language, callback) => {
  let translation = writing.translations[language];

  const typeClass = formatTypeClass(data.type);

  if (!translation)
    translation = {
      content: writing.content
    };

  [typeClass][`find${typeClass}ByIdAndFormatByLanguage`](writing.parent_id, language, (err, parent) => {
    if (err) return callback(err);

    Writer.findWriterByIdAndFormatByLanguage(writing.writer_id, language, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: writing._id.toString(),
        title: translation.title,
        identifier: writing.identifiers.find(each => writing.identifier_languages[each] == language) || writing.identifiers[0],
        [typeClass]: parent,
        writer,
        cover: writing.cover,
        content: translation.content
      });
    });
  });
};
