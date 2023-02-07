module.exports = project => {
  return project &&
    project.description &&
    project.rating &&
    project.image ? true : false
};