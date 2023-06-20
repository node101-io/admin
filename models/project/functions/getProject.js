module.exports = (project, callback) => {
  if (!project || !project._id)
    return callback('document_not_found');

  return callback(null, {
    _id: project._id.toString(),
    name: project.name.replace(project._id.toString(), ''),
    identifier: project.identifiers[0],
    description: project.description,
    rating: project.rating,
    image: project.image,
    is_completed: project.is_completed,
    social_media_accounts: project.social_media_accounts,
    translations: project.translations,
  });
}
