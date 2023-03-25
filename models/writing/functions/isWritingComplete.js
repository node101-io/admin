module.exports = writing => {
  return writing &&
    (writing.writer_id || writing.type == 'guide') && // Do not require a writer for `guide` type
    writing.subtitle && writing.subtitle.length &&
    writing.logo && writing.logo.length ? true : false
};