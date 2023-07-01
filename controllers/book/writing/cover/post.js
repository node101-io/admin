const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndGetWritingByIdAndUpdateCover(req.query.id, req.query.writing_id, req.file, (err, url) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, url }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndGetWritingByIdAndUpdateCover(req.query.id, req.query.writing_id, req.file, (err, url) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, url }));
      return res.end();
    });
};