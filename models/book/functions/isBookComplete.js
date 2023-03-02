module.exports = book => {
  return book &&
    book.description &&
    book.writer_id &&
    book.image ? true : false
};