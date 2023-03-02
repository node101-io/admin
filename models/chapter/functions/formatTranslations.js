const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (chapter, language, data) => {
  if (!data)
    data = {};

  const translations = JSON.parse(JSON.stringify(chapter.translations));

  translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : chapter.title
  };

  return translations;
};