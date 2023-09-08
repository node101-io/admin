module.exports = (event, callback) => {
    if (!event || !event._id)
      return callback('document_not_found');
  
    return callback(null, {
      _id: event._id.toString(),
      name: event.name,
      description: event.description,
      category: event.category,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date,
      logo: event.logo,
      label: event.label,
      location: event.location,
      register_url: event.register_url,
      social_media_accounts: event.social_media_accounts,
      translations: event.translations,
      is_completed: event.is_completed
    });
  }
  