const getChapter = (chapter, callback) => {
  if (!chapter || !chapter._id)
    return callback('bad_request');

  return callback(null, {
    _id: chapter._id.toString(),
    title: chapter.title,
    translations: chapter.translations,
    children: chapter.children.reverse()
  });
};

module.exports = getChapter;