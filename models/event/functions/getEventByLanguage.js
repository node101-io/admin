module.exports = (event, language, callback) => {
  let translation = event.translations[language];
  
  if (!translation)
    translation = {
      name: event.name,
      description: event.description,
      social_media_accounts: event.social_media_accounts,
			location: event.location
    };
  
  return callback(null, {
    _id: event._id.toString(),
    name: translation.name,
		start_date: event.start_date,
    end_date: event.end_date,
		description: translation.description,
		logo: event.logo,
		location: translation.location,
		created_at: event.created_at,
		register_url: event.register_url,
    is_completed: event.is_completed,
		social_media_accounts: translation.social_media_accounts
  });
}  