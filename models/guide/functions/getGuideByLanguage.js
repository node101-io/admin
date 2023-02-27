const Project = require('../../project/Project');
const Writing = require('../../writing/Writing');

module.exports = (guide, language, callback) => {
  let translation = guide.translations[language];

  if (!translation)
    translation = {
      title: guide.title,
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

    Writing.findWritingByIdAndParentIdAndFormatByLanguage(guide.writing_id, guide._id, language, (err, writing) => {
      if (err) return callback(err);

      return callback(null, {
        _id: guide._id.toString(),
        project,
        title: translation.title,
        identifier: guide.identifiers[0],
        image: guide.image,
        is_completed: guide.is_completed,
        mainnet_explorer_url: guide.mainnet_explorer_url,
        testnet_explorer_url: guide.testnet_explorer_url,
        rewards: guide.rewards,
        lock_period: guide.lock_period,
        cpu: guide.cpu,
        ram: guide.ram,
        os: guide.os,
        network: guide.network,
        frequently_asked_questions: guide.frequently_asked_questions,
        translations: guide.translations,
        is_active: guide.is_active,
        writing
      });
    });
  });
}
