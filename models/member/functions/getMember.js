module.exports = (member, callback) => {
  if (!member || !member._id)
    return callback('document_not_found');

  return callback(null, {
    _id: member._id.toString(),
    is_completed: member.is_completed,
    name: member.name,
    title: member.title ? member.title : '',
    image: member.image,
    social_media_accounts: member.social_media_accounts,
    translations: member.translations
  });
}
