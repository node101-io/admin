const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (blog, callback) => {
  if (!blog || !blog._id)
    return callback('document_not_found');

  Project.findProjectByIdAndFormat(blog.project_id, (project_err, project) => {
    Writer.findWriterByIdAndFormat(blog.writer_id, (writer_err, writer) => {
      return callback(null, {
        _id: blog._id.toString(),
        title: blog.title.replace(blog._id.toString(), ''),
        type: blog.type,
        project: project_err ? null : project,
        writer: writer_err ? null : writer,
        subtitle: blog.subtitle,
        image: blog.image,
        is_completed: blog.is_completed,
        social_media_accounts: blog.social_media_accounts,
        writing_count: blog.writing_count,
        translations: blog.translations
      });
    });
  });
};
