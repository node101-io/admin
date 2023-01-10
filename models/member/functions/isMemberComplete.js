const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = writer => {
  return writer && writer._id &&
    writer.name && typeof writer.name == 'string' && writer.name.trim().length && writer.name.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
    writer.title && typeof writer.title == 'string' && writer.title.trim().length && writer.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
    writer.image && typeof writer.image == 'string' && writer.image.trim().length && writer.image.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH
};