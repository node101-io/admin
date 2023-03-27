const Project = require('../../project/Project');
const Writing = require('../../writing/Writing');

module.exports = (guide, callback) => {
  if (!guide || !guide._id)
    return callback('document_not_found');

  Writing.findWritingByIdAndParentIdAndFormat(guide.writing_id, guide._id, (err, writing) => {
    if (err) return callback(err);

    if (guide.project_id) {
      Project.findProjectByIdAndFormat(guide.project_id, (err, project) => {
        if (err) return callback(err);
    
        return callback(null, {
          _id: guide._id.toString(),
          project,
          title: guide.title.replace(guide._id.toString(), ''),
          subtitle: guide.subtitle,
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
          social_media_accounts: guide.social_media_accounts,
          translations: guide.translations,
          is_active: guide.is_active,
          writing
        });
      });
    } else {
      return callback(null, {
        _id: guide._id.toString(),
        project: null,
        title: guide.title.replace(guide._id.toString(), ''),
        subtitle: guide.subtitle,
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
        social_media_accounts: guide.social_media_accounts,
        translations: guide.translations,
        is_active: guide.is_active,
        writing
      });
    }
  });

}