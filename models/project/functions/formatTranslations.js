const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;

module.exports = (project, data) => {
  const old = project.translations[data.language.toString().trim()] ? project.translations[data.language.toString().trim()] : project;

  project.translations[data.language.toString().trim()] = {
    name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : old.name,
    description: data.description && typeof data.description == 'string' && data.description.trim().length && data.description.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.description.trim() : old.description,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : old.social_media_accounts,
  };

  return project.translations;
};