const Writer = require('../../writer/Writer');

module.exports = (writing, language, callback) => {
  let translation = writing.translations[language];

  if (!translation)
    translation = {
      title: writing.title.replace(writing._id.toString(), ''),
      subtitle: writing.subtitle,
      content: writing.content,
      flag: writing.flag,
      social_media_accounts: writing.social_media_accounts,
      is_hidden: writing.is_hidden
    };

  if (writing.writer_id) {
    Writer.findWriterByIdAndFormatByLanguage(writing.writer_id, language, (err, writer) => {
      if (err) return callback(err);
  
      return callback(null, {
        _id: writing._id.toString(),
        title: translation.title.replace(writing._id.toString(), ''),
        identifier: writing.identifiers.find(each => writing.identifier_languages[each] == language) || writing.identifiers[0],
        parent_id: writing.parent_id,
        writer,
        created_at: writing.created_at,
        logo: writing.logo,
        cover: writing.cover,
        subtitle: translation.subtitle,
        content: translation.content,
        is_completed: writing.is_completed,
        label: writing.label,
        flag: translation.flag,
        social_media_accounts: translation.social_media_accounts,
        is_hidden: translation.is_hidden
      });
    });
  } else {
    return callback(null, {
      _id: writing._id.toString(),
      title: translation.title.replace(writing._id.toString(), ''),
      identifier: writing.identifiers.find(each => writing.identifier_languages[each] == language) || writing.identifiers[0],
      parent_id: writing.parent_id,
      writer_id: writing.writer_id,
      created_at: writing.created_at,
      logo: writing.logo,
      cover: writing.cover,
      subtitle: translation.subtitle,
      content: translation.content,
      is_completed: writing.is_completed,
      label: writing.label,
      flag: translation.flag,
      social_media_accounts: translation.social_media_accounts,
      is_hidden: translation.is_hidden
    });
  }
};
