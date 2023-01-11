const Project = require('../../project/Project');

module.exports = (stake, language, callback) => {
  let translation = stake.translations[language];

  if (!translation)
    translation = {
      stake_url: project.stake_url,
      how_to_stake_url: project.how_to_stake_url,
    };

  Project.findProjectByIdAndFormatByLanguage(stake.project_id, language, (err, project) => {
    if (err) return callback(err);

    return callback(null, {
      _id: stake._id.toString(),
      project,
      apr: stake.apr,
      image: stake.image,
      stake_url: translation.stake_url,
      how_to_stake_url: translation.how_to_stake_url,
      not_yet_stakable: stake.not_yet_stakable,
      is_completed: stake.is_completed,
      is_active: stake.is_active
    });
  });
}
