module.exports = writing => {
  return writing &&
    writing.subtitle && writing.subtitle.length &&
    writing.logo && writing.logo.length &&
    writing.cover && writing.cover.length &&
    writing.content && writing.content.length ? true : false
};