const Writer = require('../../writer/Writer');

module.exports = (writing, language, callback) => {
  let translation = writing.translations[language];

  if (!translation)
    translation = {};
  if (!translation.title || !translation.title.length)
    translation.title = writing.title;
  if (!translation.subtitle || !translation.subtitle.length)
    translation.subtitle = writing.subtitle
  if (!translation.logo || !translation.logo.length)
    translation.logo = writing.logo;
  if (!translation.cover || !translation.cover.length)
    translation.cover = writing.cover;
  if (!translation.content || !translation.content.length)
    translation.content = writing.content;
  if (!translation.flag || !translation.flag.length)
    translation.flag = writing.flag;
  if (!translation.social_media_accounts || typeof translation.social_media_accounts != 'object')
    translation.social_media_accounts = {};
  Object.keys(writing.social_media_accounts).forEach(key => {
    if (!translation.social_media_accounts[key])
      translation.social_media_accounts[key] = writing.social_media_accounts[key];
  });
  if (!('is_hidden' in translation))
    translation.is_hidden = writing.is_hidden ? true : false;

  if (writing.writer_id) {
    Writer.findWriterByIdAndFormatByLanguage(writing.writer_id, language, (err, writer) => {
      if (err) return callback(err);
  
      return callback(null, {
        _id: writing._id.toString(),
        title: translation.title.replace(writing._id.toString(), ''),
        identifier: writing.identifiers.find(each => writing.identifier_languages[each] == language) || writing.identifiers[0],
        parent_id: writing.parent_id,
        parent_title: writing.parent_title,
        writer,
        created_at: writing.created_at,
        logo: translation.logo,
        cover: translation.cover,
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
      parent_title: writing.parent_title,
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
