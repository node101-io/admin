const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writing, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(writing.translations));

  translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writing.title,
    parent_title: data.parent_title && typeof data.parent_title == 'string' && data.parent_title.trim().length && data.parent_title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_title.trim() : writing.parent_title,
    subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : writing.subtitle,
    logo: data.logo && typeof data.logo == 'string' && data.logo.trim().length && data.logo.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH  ? data.logo.trim() : writing.logo,
    cover: data.cover && typeof data.cover == 'string' && data.cover.trim().length && data.cover.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH  ? data.cover.trim() : writing.cover,
    content: data.content && Array.isArray(data.content) && !data.content.find(each => typeof each != 'string' || !each.trim().length || each.trim().length > MAX_DATABASE_LONG_TEXT_FIELD_LENGTH) ? data.content.map(each => each.trim()) : writing.content,
    flag: data.flag && typeof data.flag == 'string' && data.flag.trim().length && data.flag.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.flag.trim() : writing.flag,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : writing.social_media_accounts,
    is_hidden: 'is_hidden' in data ? (data.is_hidden ? true : false) : writing.is_hidden
  };

  return translations;
};