module.exports = (tag, callback) => {
  if (!tag || !tag._id)
    return callback('document_not_found');

  return callback(null, {
    _id: tag._id.toString(),
    name: tag.name,
    identifier: tag.identifiers[0],
    url: tag.url,
    is_completed: tag.is_completed,
    language: tag.language,
  });
}
