const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (blog, language, data) => {
  if (!data)
    data = {};

  blog.translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : blog.title,
    subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : blog.subtitle,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : writer.social_media_accounts,
  };

  return blog.translations;
};