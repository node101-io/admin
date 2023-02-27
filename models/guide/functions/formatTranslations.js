const getFrequentlyAskedQuestions = require('./getFrequentlyAskedQuestions');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (guide, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(guide.translations));

  translations[language.toString().trim()] = {
    mainnet_explorer_url: data.mainnet_explorer_url && typeof data.mainnet_explorer_url == 'string' && data.mainnet_explorer_url.trim().length && data.mainnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.mainnet_explorer_url.trim() : guide.mainnet_explorer_url,
    testnet_explorer_url: data.testnet_explorer_url && typeof data.testnet_explorer_url == 'string' && data.testnet_explorer_url.trim().length && data.testnet_explorer_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.testnet_explorer_url.trim() : guide.testnet_explorer_url,
    rewards: data.rewards && typeof data.rewards == 'string' && data.rewards.trim().length && data.rewards.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.rewards.trim() : guide.rewards,
    lock_period: data.lock_period && typeof data.lock_period == 'string' && data.lock_period.trim().length && data.lock_period.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.lock_period.trim() : guide.lock_period,
    cpu: data.cpu && typeof data.cpu == 'string' && data.cpu.trim().length && data.cpu.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.cpu.trim() : guide.cpu,
    ram: data.ram && typeof data.ram == 'string' && data.ram.trim().length && data.ram.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.ram.trim() : guide.ram,
    os: data.os && typeof data.os == 'string' && data.os.trim().length && data.os.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.os.trim() : guide.os,
    network: data.network && typeof data.network == 'string' && data.network.trim().length && data.network.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.network.trim() : guide.network,
    frequently_asked_questions: data.frequently_asked_questions ? getFrequentlyAskedQuestions(data.frequently_asked_questions) : guide.frequently_asked_questions
  };

  return translations;
};