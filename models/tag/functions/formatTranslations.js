const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (tag, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(tag.translations));

  translations[language.toString().trim()] = {
    name: data.name && typeof data.name == 'string' && data.name.trim().length && data.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.name.trim() : tag.name
  };

  return translations;
};