module.exports = (event, callback) => {
    if (!event || !event._id)
      return callback('document_not_found');
  
    return callback(null, {
      _id: event._id.toString(),
      name: event.name.replace(event._id.toString(), ''),
      start_date: event.start_date,
      end_date: event.end_date,
      identifier: event.identifiers[0],
      description: event.description,
      logo: event.logo,
      location: event.location,
      register_url: event.register_url,
      event_type: event.event_type,
      is_completed: event.is_completed,
      social_media_accounts: event.social_media_accounts,
      translations: event.translations
    });
  }
  