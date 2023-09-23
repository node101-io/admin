const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (venue, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(venue.translations));

  translations[language.toString().trim()] = {
    name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : venue.name,
    description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.description.trim() : venue.description,
    address: data.address && typeof data.address == 'string' && data.address.trim().length && data.address.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.address.trim() : venue.address,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : venue.social_media_accounts,
  };

  return translations;
};