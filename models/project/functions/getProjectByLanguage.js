module.exports = (project, language, callback) => {
  let translation = project.translations[language];

  if (!translation)
    translation = {
      name: project.name.replace(project._id.toString(), ''),
      description: project.description,
      social_media_accounts: project.social_media_accounts
    };

  return callback(null, {
    _id: project._id.toString(),
    name: translation.name.replace(project._id.toString(), ''),
    identifier: project.identifiers.find(each => project.identifier_languages[each] == language) || project.identifiers[0],
    description: translation.description,
    rating: project.rating,
    image: project.image,
    is_completed: project.is_completed,
    social_media_accounts: translation.social_media_accounts,
    wizard_key: project.wizard_key,
    system_requirements: project.system_requirements,
    is_mainnet: project.is_mainnet
  });
}