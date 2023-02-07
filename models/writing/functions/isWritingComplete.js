module.exports = writing => {
  return writing &&
    writing.cover &&
    writing.writer_id &&
    writing.content && writing.content.length ? true : false
};