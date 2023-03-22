module.exports = (stake, callback) => {
  if (!stake || !stake._id)
    return callback('document_not_found');

  return callback(null, {
    _id: stake._id.toString(),
    apr: stake.apr,
    image: stake.image,
    stake_url: stake.stake_url,
    how_to_stake_url: stake.how_to_stake_url,
    not_yet_stakable: stake.not_yet_stakable,
    is_completed: stake.is_completed,
    translations: stake.translations,
    is_active: stake.is_active
  });
}
