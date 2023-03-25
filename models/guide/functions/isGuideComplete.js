module.exports = guide => {
  return guide &&
    guide.project_id &&
    guide.subtitle && guide.subtitle.length &&
    guide.image ? true : false
  ;
};