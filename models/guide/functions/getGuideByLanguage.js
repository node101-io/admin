const Project = require('../../project/Project');
const Writing = require('../../writing/Writing');

module.exports = (guide, language, callback) => {
  let translation = guide.translations[language];

  if (!translation)
    translation = {
      title: guide.title.replace(guide._id.toString(), ''),
      subtitle: guide.subtitle,
      mainnet_explorer_url: guide.mainnet_explorer_url,
      testnet_explorer_url: guide.testnet_explorer_url,
      rewards: guide.rewards,
      lock_period: guide.lock_period,
      cpu: guide.cpu,
      ram: guide.ram,
      os: guide.os,
      network: guide.network,
      frequently_asked_questions: guide.frequently_asked_questions,
      social_media_accounts: guide.social_media_accounts
    };

  Writing.findWritingByIdAndParentIdAndFormatByLanguage(guide.writing_id, guide._id, language, (err, writing) => {
    if (err) return callback(err);

    if (guide.project_id) {
      Project.findProjectByIdAndFormatByLanguage(guide.project_id, language, (err, project) => {
        if (err) return callback(err);
    
        return callback(null, {
          _id: guide._id.toString(),
          title: translation.title,
          type: guide.type,
          project,
          writer,
          subtitle: translation.subtitle,
          image: guide.image,
          mainnet_explorer_url: translation.mainnet_explorer_url,
          testnet_explorer_url: translation.testnet_explorer_url,
          rewards: translation.rewards,
          lock_period: translation.lock_period,
          cpu: translation.cpu,
          ram: translation.ram,
          os: translation.os,
          network: translation.network,
          frequently_asked_questions: translation.frequently_asked_questions,
          social_media_accounts: translation.social_media_accounts,
          is_completed: guide.is_completed
        });
      });
    } else {
      return callback(null, {
        _id: guide._id.toString(),
        title: translation.title,
        type: guide.type,
        project: null,
        writer,
        subtitle: translation.subtitle,
        image: guide.image,
        mainnet_explorer_url: translation.mainnet_explorer_url,
        testnet_explorer_url: translation.testnet_explorer_url,
        rewards: translation.rewards,
        lock_period: translation.lock_period,
        cpu: translation.cpu,
        ram: translation.ram,
        os: translation.os,
        network: translation.network,
        frequently_asked_questions: translation.frequently_asked_questions,
        social_media_accounts: translation.social_media_accounts,
        is_completed: guide.is_completed
      });
    }
  });
};