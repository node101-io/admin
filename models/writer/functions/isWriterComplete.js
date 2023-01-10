const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = writer => {
  return writer &&
    writer.title &&
    writer.image
};