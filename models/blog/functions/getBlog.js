const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (blog, callback) => {
  if (!blog || !blog._id)
    return callback('document_not_found');

  if (!blog.is_completed)
    return callback(null, {
      _id: blog._id.toString(),
      title: blog.title,
      type: blog.type,
      project_id: blog.project_id,
      writer_id: blog.writer_id,
      subtitle: blog.subtitle,
      cover: blog.cover,
      is_completed: blog.is_completed,
      is_active: blog.is_active,
      writing_count: blog.writing_count
    });

  if (blog.type == 'project') {
    Project.findProjectByIdAndFormat(blog.project_id, (err, project) => {
      if (err) return callback(err);

      Writer.findWriterByIdAndFormat(blog.writer_id, (err, writer) => {
        if (err) return callback(err);

        return callback(null, {
          _id: blog._id.toString(),
          title: blog.title,
          type: blog.type,
          project,
          writer,
          subtitle: blog.subtitle,
          cover: blog.cover,
          is_completed: blog.is_completed,
          is_active: blog.is_active,
          writing_count: blog.writing_count
        });
      });
    });
  } else {
    Writer.findWriterByIdAndFormat(blog.writer_id, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: blog._id.toString(),
        title: blog.title,
        type: blog.type,
        project,
        writer,
        subtitle: blog.subtitle,
        cover: blog.cover,
        is_completed: blog.is_completed,
        is_active: blog.is_active,
        writing_count: blog.writing_count
      });
    });
  };
};
