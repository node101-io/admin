module.exports = venue => {
  return venue &&
    venue.name &&
    venue.description &&
    venue.image &&
    venue.address &&
    venue.district ? true : false
};