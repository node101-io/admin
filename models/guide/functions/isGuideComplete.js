module.exports = guide => {
  return guide &&
    guide.project_id &&
    guide.subtitle && guide.subtitle.length &&
    guide.wizard_key && guide.wizard_key.length &&
    guide.image ? true : false
  ;
};