const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (stake, data) => {
  const old = stake.translations[data.language.toString().trim()] ? stake.translations[data.language.toString().trim()] : stake;

  stake.translations[data.language.toString().trim()] = {
    stake_url: data.stake_url && typeof data.stake_url == 'string' && data.stake_url.trim().length && data.stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.stake_url.trim() : old.stake_url,
    how_to_stake_url: data.how_to_stake_url && typeof data.how_to_stake_url == 'string' && data.how_to_stake_url.trim().length && data.how_to_stake_url.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.how_to_stake_url.trim() : old.how_to_stake_url,
  };

  return stake.translations;
};