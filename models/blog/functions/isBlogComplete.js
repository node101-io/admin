module.exports = blog => {
  return blog &&
    blog.type && (blog.type != 'project' || blog.project_id) &&
    blog.writer_id &&
    blog.subtitle &&
    blog.image ? true : false
};