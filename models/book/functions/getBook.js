const Project = require('../../project/Project');
const Writer = require('../../writer/Writer');

module.exports = (book, callback) => {
  if (!book || !book._id)
    return callback('document_not_found');

  if (book.writer_id) {
    if (book.project_id) {
      Writer.findWriterById(book.writer_id, (err, writer) => {
        if (err) return callback(err);

        Project.findProjectById(book.project_id, (err, project) => {
          if (err) return callback(err);

          return callback(null, {
            _id: book._id.toString(),
            name: book.name.replace(book._id.toString(), ''),
            identifier: book.identifiers[0],
            description: book.description,
            image: book.image,
            project,
            writer,
            is_completed: book.is_completed,
            social_media_accounts: book.social_media_accounts,
            translations: book.translations,
            children: book.children.reverse()
          });
        });
      });
    } else {
      Writer.findWriterById(book.writer_id, (err, writer) => {
        if (err) return callback(err);

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
    }
  } else {
    if (book.project_id) {
      Project.findProjectById(book.project_id, (err, project) => {
        if (err) return callback(err);

        return callback(null, {
          _id: book._id.toString(),
          name: book.name.replace(book._id.toString(), ''),
          identifier: book.identifiers[0],
          description: book.description,
          image: book.image,
          project,
          writer_id: book.writer_id,
          is_completed: book.is_completed,
          social_media_accounts: book.social_media_accounts,
          translations: book.translations,
          children: book.children.reverse()
        });
      });
    } else {
      return callback(null, {
        _id: book._id.toString(),
        name: book.name.replace(book._id.toString(), ''),
        identifier: book.identifiers[0],
        description: book.description,
        image: book.image,
        project_id: book.project_id,
        writer_id: book.writer_id,
        is_completed: book.is_completed,
        social_media_accounts: book.social_media_accounts,
        translations: book.translations,
        children: book.children.reverse()
      });
    };
  };
};
