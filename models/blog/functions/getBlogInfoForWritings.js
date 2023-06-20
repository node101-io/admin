const LANGUAGE_VALUES = ['tr', 'ru'];
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = blog => {
  if (!blog || typeof blog != 'object')
    return {};

  const data = {
    identifiers: blog.identifiers,
    identifier_languages: blog.identifier_languages,
    translations: {}
  };

  if (blog.title && typeof blog.title == 'string' && blog.title.trim().length && blog.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    data.title = blog.title.trim();

  if (blog.image && typeof blog.image == 'string' && blog.image.trim().length && blog.image.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
    data.image = blog.image.trim();

  if (blog.translations)
    LANGUAGE_VALUES.forEach(language => {
      data.translations[language] = {};

      if (!blog.translations[language])
        return;

      if (blog.translations[language].title && typeof blog.translations[language].title == 'string' && blog.translations[language].title.trim().length && blog.translations[language].title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH)
        data.translations[language].title = blog.translations[language].title.trim();
    });

  return data;
}