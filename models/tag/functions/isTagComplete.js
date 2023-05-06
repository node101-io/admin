module.exports = tag => {
  return tag &&
    tag.name &&
    tag.url ? true : false
};