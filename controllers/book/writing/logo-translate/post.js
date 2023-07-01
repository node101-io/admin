const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndGetWritingByIdAndUpdateLogoTranslation(req.query.id, req.query.writing_id, req.query.language, req.file, (err, url) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, url }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndGetWritingByIdAndUpdateLogoTranslation(req.query.id, req.query.writing_id, req.query.language, req.file, (err, url) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, url }));
      return res.end();
    });
};