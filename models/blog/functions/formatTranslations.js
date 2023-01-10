const validator = require('validator');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = (writer, data) => {
  if (!data || typeof data != 'object')
    return writer.translations;

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return writer.translations;

  const old = writer.translations[data.language.toString().trim()] ? writer.translations[data.language.toString().trim()] : writer;

  writer.translations[data.language.toString().trim()] = {
    title: data.title && typeof data.title == 'string' && data.title.trim().length && data.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.title.trim() : old.title,
    subtitle: data.subtitle && typeof data.subtitle == 'string' && data.subtitle.trim().length && data.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH ? data.subtitle.trim() : old.subtitle,
    cover: old.cover
  };

  return writer.translations;
};