const Project = require('../../project/Project');

module.exports = (guide, language, callback) => {
  let translation = guide.translations[language];

  if (!translation)
    translation = {
      mainnet_explorer_url: guide.mainnet_explorer_url,
      testnet_explorer_url: guide.testnet_explorer_url,
      rewards: guide.rewards,
      lock_period: guide.lock_period,
      cpu: guide.cpu,
      ram: guide.ram,
      os: guide.os,
      network: guide.network,
      frequently_asked_questions: guide.frequently_asked_questions
    };

  Project.findProjectByIdAndFormatByLanguage(guide.project_id, language, (err, project) => {
    if (err) return callback(err);

    return callback(null, {
      _id: guide._id.toString(),
      project,
      apr: guide.apr,
      image: guide.image,
      guide_url: translation.guide_url,
      how_to_guide_url: translation.how_to_guide_url,
      not_yet_stakable: guide.not_yet_stakable,
      is_completed: guide.is_completed,
      is_active: guide.is_active
    });
  });
}
