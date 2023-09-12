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
    description: translation.description,
    category: event.category,
    event_type: event.event_type,
		start_date: event.start_date,
    end_date: event.end_date,
		logo: event.logo,
    label: event.label,
		location: translation.location,
		register_url: event.register_url,
    is_slider: event.is_slider,
    is_side: event.is_side,
    social_media_accounts: translation.social_media_accounts,
    is_completed: event.is_completed,
  });
}  