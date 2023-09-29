const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (book, language, callback) => {
  let translation = book.translations[language];

  if (!translation)
    translation = {
      title: book.title.replace(book._id.toString(), ''),
      subtitle: book.subtitle,
      social_media_accounts: book.social_media_accounts
    };

  Project.findProjectByIdAndFormatByLanguage(book.project_id, language, (project_err, project) => {
    Writer.findWriterByIdAndFormatByLanguage(book.writer_id, language, (writer_err, writer) => {
      return callback(null, {
        _id: book._id.toString(),
        name: book.name.replace(book._id.toString(), ''),
        identifier: book.identifiers[0],
        description: book.description,
        image: book.image,
        project_id: book.project_id,
        writer,
        is_completed: book.is_completed,
        social_media_accounts: book.social_media_accounts,
        translations: book.translations,
        children: book.children.reverse()
      });
    });
  });
};