const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writer, data) => {
  const old = writer.translations[data.language.toString().trim()] ? writer.translations[data.language.toString().trim()] : writer;

  writer.translations[data.language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : old.title,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : old.social_media_accounts
  };

  return writer.translations;
};