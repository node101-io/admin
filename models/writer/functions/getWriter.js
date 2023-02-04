module.exports = (writer, callback) => {
  if (!writer || !writer._id)
    return callback('document_not_found');

  return callback(null, {
    _id: writer._id.toString(),
    is_completed: writer.is_completed,
    name: writer.name.replace(writer._id.toString(), ''),
    title: writer.title ? writer.title : '',
    image: writer.image,
    social_media_accounts: writer.social_media_accounts,
    translations: writer.translations
  });
}
