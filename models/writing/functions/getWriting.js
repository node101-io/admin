const Writer = require('../../writer/Writer');

module.exports = (writing, callback) => {
  Writer.findWriterByIdAndFormat(writing.writer_id, (err, writer) => {
    if (err) return callback(err);

    return callback(null, {
      _id: writing._id.toString(),
      title: writing.title.replace(writing._id.toString(), ''),
      identifier: writing.identifiers[0],
      parent_id: writer.parent_id,
      writer,
      subtitle: writing.subtitle,
      cover: writing.cover,
      content: writing.content,
      is_completed: writing.is_completed,
      social_media_accounts: writing.social_media_accounts,
      translations: writing.translations
    });
  });
};
