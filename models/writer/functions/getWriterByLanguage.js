module.exports = (writer, language, callback) => {
  let translation = writer.translations[language];

  if (!translation)
    translation = {
      title: writer.title,
      social_media_accounts: writer.social_media_accounts
    };

  return callback(null, {
    _id: writer._id.toString(),
    is_completed: writer.is_completed,
    name: writer.name,
    title: translation.title,
    image: writer.image,
    social_media_accounts: translation.social_media_accounts,
    is_deleted: writer.is_deleted
  });
}  