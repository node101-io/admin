module.exports = (venue, callback) => {
  if (!venue || !venue._id)
    return callback('document_not_found');

  return callback(null, {
    _id: venue._id.toString(),
    name: venue.name.replace(venue._id.toString(), ''),
    description: venue.description,
    image: venue.image,
    address: venue.address,
    province: venue.province,
    seated_capacity: venue.seated_capacity,
    standing_capacity: venue.standing_capacity,
    contact_number: venue.contact_number,
    contact_email: venue.contact_email,
    is_completed: venue.is_completed,
    social_media_accounts: venue.social_media_accounts,
    translations: venue.translations,
  });
}
