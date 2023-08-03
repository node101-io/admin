module.exports = (tag, language, callback) => {
  return callback(null, {
    _id: tag._id.toString(),
    name: tag.name,
    identifier: tag.identifiers.find(each => tag.identifier_languages[each] == language) || tag.identifiers[0],
    url: tag.url,
    is_completed: tag.is_completed
  });
}