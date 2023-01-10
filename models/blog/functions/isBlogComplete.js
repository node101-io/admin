const validator = require('validator');

const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const TYPE_VALUES = ['node101', 'project', 'terms'];

module.exports = blog => {
  return blog && blog._id &&
    blog.title && typeof blog.title == 'string' && blog.title.trim().length && blog.title.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
    blog.type && TYPE_VALUES.includes(blog.type) && (blog.type != 'project' || (blog.project_id && validator.isMongoId(blog.project_id.toString()))) &&
    blog.writer_id && validator.isMongoId(blog.writer_id.toString()) &&
    blog.subtitle && typeof blog.subtitle == 'string' && blog.subtitle.trim().length && blog.subtitle.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
    blog.cover && typeof blog.cover == 'string' && blog.cover.trim().length && blog.cover.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH
};