const getSocialMediaAccounts = require('./getSocialMediaAccounts');

const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writing, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(writing.translations));
  const translation = writing.translations[language] ? JSON.parse(JSON.stringify(writing.translations[language])) : {};

  if (!translation.title || !translation.title.length)
    translation.title = writing.title;
  if (!translation.subtitle || !translation.subtitle.length)
    translation.subtitle = writing.subtitle
  if (!translation.logo || !translation.logo.length)
    translation.logo = writing.logo;
  if (!translation.cover || !translation.cover.length)
    translation.cover = writing.cover;
  if (!translation.content || !translation.content.length)
    translation.content = writing.content;
  if (!translation.flag || !translation.flag.length)
    translation.flag = writing.flag;
  if (!translation.social_media_accounts || typeof translation.social_media_accounts != 'object')
    translation.social_media_accounts = {};
  Object.keys(writing.social_media_accounts).forEach(key => {
    if (!translation.social_media_accounts[key])
      translation.social_media_accounts[key] = writing.social_media_accounts[key];
  });
  if (!('is_hidden' in translation))
    translation.is_hidden = writing.is_hidden ? true : false;

  translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : translation.title,
    parent_title: data.parent_title && typeof data.parent_title == 'string' && data.parent_title.trim().length && data.parent_title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.parent_title.trim() : translation.parent_title,
    subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : translation.subtitle,
    logo: data.logo && typeof data.logo == 'string' && data.logo.trim().length && data.logo.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH  ? data.logo.trim() : translation.logo,
    cover: data.cover && typeof data.cover == 'string' && data.cover.trim().length && data.cover.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH  ? data.cover.trim() : translation.cover,
    content: data.content && Array.isArray(data.content) && !data.content.find(each => typeof each != 'string' || !each.trim().length || each.trim().length > MAX_DATABASE_LONG_TEXT_FIELD_LENGTH) ? data.content.map(each => each.trim()) : translation.content,
    flag: data.flag && typeof data.flag == 'string' && data.flag.trim().length && data.flag.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.flag.trim() : translation.flag,
    social_media_accounts: data.social_media_accounts && typeof data.social_media_accounts == 'object' ? getSocialMediaAccounts(data.social_media_accounts) : translation.social_media_accounts,
    is_hidden: 'is_hidden' in data ? (data.is_hidden ? true : false) : translation.is_hidden
  };

  return translations;
};