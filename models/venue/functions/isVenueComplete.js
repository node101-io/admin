module.exports = venue => {
  return venue &&
    venue.name &&
    venue.description &&
    venue.image &&
    venue.address &&
    venue.province &&
    venue.seated_capacity &&
    venue.standing_capacity ? true : false
};