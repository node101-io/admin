const Writer = require('../../writer/Writer');

module.exports = (writing, callback) => {
  Writer.findWriterByIdAndFormat(writing.writer_id, (err, writer) => {
    if (err) return callback(err);

    return callback(null, {
      _id: writing._id.toString(),
      title: writing.title.replace(writing._id.toString(), ''),
      identifier: writing.identifiers[0],
      parent_id: writing.parent_id,
      created_at: writing.created_at,
      writer,
      subtitle: writing.subtitle,
      logo: writing.logo,
      cover: writing.cover,
      content: writing.content,
      is_completed: writing.is_completed,
      label: writing.label,
      flag: writing.flag,
      social_media_accounts: writing.social_media_accounts,
      is_hidden: writing.is_hidden,
      translations: writing.translations
    });
  });
};
