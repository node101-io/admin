const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (blog, language, callback) => {
  let translation = blog.translations[language];

  if (!translation)
    translation = {
      title: blog.title.replace(blog._id.toString(), ''),
      subtitle: blog.subtitle,
      social_media_accounts: blog.social_media_accounts
    };

  if (blog.type == 'project') {
    Project.findProjectByIdAndFormatByLanguage(blog.project_id, language, (err, project) => {
      if (err) return callback(err);

      Writer.findWriterByIdAndFormatByLanguage(blog.writer_id, language, (err, writer) => {
        if (err) return callback(err);

        return callback(null, {
          _id: blog._id.toString(),
          title: translation.title,
          type: blog.type,
          project,
          writer,
          subtitle: translation.subtitle,
          image: blog.image,
          social_media_accounts: translation.social_media_accounts,
          is_completed: blog.is_completed
        });
      });
    });
  } else {
    Writer.findWriterByIdAndFormatByLanguage(blog.writer_id, language, (err, writer) => {
      if (err) return callback(err);

      return callback(null, {
        _id: blog._id.toString(),
        title: translation.title,
        type: blog.type,
        project,
        writer,
        subtitle: translation.subtitle,
        image: blog.image,
        social_media_accounts: translation.social_media_accounts,
        is_completed: blog.is_completed
      });
    });
  };
};