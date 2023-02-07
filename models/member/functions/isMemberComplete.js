module.exports = member => {
  return member &&
    member.title &&
    member.image ? true : false
  ;
};