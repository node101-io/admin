const MAX_DATABASE_LONG_TEXT_FIELD_LENGTH = 1e5;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writing, language, data) => {
  if (!data)
    data = {};

  writing.translations[language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : writing.title,
    content: data.content && typeof data.content == 'string' && data.content.trim().length && data.content.trim().length < MAX_DATABASE_LONG_TEXT_FIELD_LENGTH ? data.content.trim() : writing.content
  };

  return writing.translations;
};