const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writing, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(writing.translations));

  translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writing.title,
    subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : writing.subtitle,
    content: data.content && typeof data.content == 'string' && data.content.trim().length && data.content.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.content.trim() : writing.content,
    flag: data.flag && typeof data.flag == 'string' && data.flag.trim().length && data.flag.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.flag.trim() : writing.flag,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : writing.social_media_accounts
  };

  return translations;
};