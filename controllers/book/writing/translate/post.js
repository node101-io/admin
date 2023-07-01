const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndGetWritingByIdAndUpdateTranslations(req.query.id, req.query.writing_id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndGetWritingByIdAndUpdateTranslations(req.query.id, req.query.writing_id, req.body, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
};