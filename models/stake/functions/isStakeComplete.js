module.exports = stake => {
  return stake &&
    stake.image &&
    (
      stake.not_yet_stakable
      ||
      (
        stake.apr &&
        stake.price &&
        stake.stake_url &&
        stake.how_to_stake_url
      )
    ) ? true : false
  ;
};