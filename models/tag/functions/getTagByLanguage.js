module.exports = (tag, language, callback) => {
  let translation = tag.translations[language];

  if (!translation)
    translation = {};
  if (!translation.name || !translation.name.trim().length)
    translation.name = tag.name;

  return callback(null, {
    _id: tag._id.toString(),
    name: translation.name,
    identifier: tag.identifiers.find(each => tag.identifier_languages[each] == language) || tag.identifiers[0],
    url: tag.url,
    is_completed: tag.is_completed
  });
}