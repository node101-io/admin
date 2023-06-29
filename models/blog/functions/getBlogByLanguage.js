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

  Project.findProjectByIdAndFormatByLanguage(blog.project_id, language, (project_err, project) => {
    Writer.findWriterByIdAndFormatByLanguage(blog.writer_id, language, (writer_err, writer) => {
      return callback(null, {
        _id: blog._id.toString(),
        title: translation.title,
        type: blog.type,
        project: project_err ? null : project,
        writer: writer_err ? null : writer,
        subtitle: translation.subtitle,
        image: blog.image,
        is_completed: blog.is_completed,
        social_media_accounts: translation.social_media_accounts,
        writing_count: blog.writing_count,
        translations: blog.translations
      });
    });
  });
};