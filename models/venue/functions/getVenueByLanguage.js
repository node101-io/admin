module.exports = (venue, language, callback) => {
  let translation = venue.translations[language];

  if (!translation)
    translation = {
      name: venue.name.replace(venue._id.toString(), ''),
      description: venue.description,
      address: venue.address,
      social_media_accounts: venue.social_media_accounts
    };

  return callback(null, {
    _id: venue._id.toString(),
    name: translation.name.replace(venue._id.toString(), ''),
    description: translation.description,
    image: venue.image,
    address: translation.address,
    district: venue.district,
    seated_capacity: venue.seated_capacity,
    standing_capacity: venue.standing_capacity,
    contact_number: venue.contact_number,
    contact_email: venue.contact_email,
    is_completed: venue.is_completed,
    social_media_accounts: translation.social_media_accounts,
  });
}