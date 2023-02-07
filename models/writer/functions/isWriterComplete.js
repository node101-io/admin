module.exports = writer => {
  return writer &&
    writer.title &&
    writer.image ? true : false
};