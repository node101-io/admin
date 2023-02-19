module.exports = writing => {
  return writing &&
    writing.subtitle && writing.subtitle.length &&
    writing.cover &&
    writing.content && writing.content.length ? true : false
};