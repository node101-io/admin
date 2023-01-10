const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const PROJECT_RATING_MIN_VALUE = 1;
const PROJECT_RATING_MAX_VALUE = 5;

module.exports = stake => {
  return stake && stake._id &&
    stake.apr &&
    stake.image &&
    (
      (stake.not_yet_stakable)
      ||
      (
        stake.stake_url &&
        stake.how_to_stake_url
      )
    ) 
};