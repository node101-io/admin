const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (blog, language, callback) => {
  let translation = blog.translations[language];

  if (!translation)
    translation = {
      title: blog.title,
      subtitle: blog.subtitle,
      cover: blog.cover
    };

  if (blog.type == 'project') {
    Project.findProjectByIdAndFormatByLanguage(blog.project_id, language, (err, project) => {
      if (err) return callback(err);

      Writer.findWriterByIdAndFormatByLanguage(blog.writer_id, language, (err, writer) => {
        if (err) return callback(err);

        return callback(null, {
          _id: blog._id.toString(),
          title: translations.title,
          type: blog.type,
          project,
          writer,
          subtitle: translations.subtitle,
          cover: translations.cover,
          is_completed: blog.is_completed,
          is_active: blog.is_active
        });
      });
    });
  } else {
    Writer.findWriterByIdAndFormatByLanguage(blog.writer_id, language, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: blog._id.toString(),
        title: translations.title,
        type: blog.type,
        project,
        writer,
        subtitle: translations.subtitle,
        cover: translations.cover,
        is_completed: blog.is_completed,
        is_active: blog.is_active
      });
    });
  };
};