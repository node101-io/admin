const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (event, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(event.translations));

  translations[language.toString().trim()] = {
    name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : event.name,
    date: data.date && typeof data.date == 'string' && !isNaN(Date.parse(data.date)) ? new Date(data.date) : event.date,
    description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : event.description,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : event.social_media_accounts,
    location: data.location && typeof data.location == 'string' && data.location.trim().length && data.location.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.location.trim() : event.location,
  };

  return translations;
};