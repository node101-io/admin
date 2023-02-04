module.exports = stake => {
  return stake &&
    stake.apr &&
    stake.image &&
    (
      stake.not_yet_stakable
      ||
      (
        stake.stake_url &&
        stake.how_to_stake_url
      )
    )
  ;
};