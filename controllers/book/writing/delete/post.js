const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndGetWritingByIdAndDelete(req.query.id, req.body.id, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndGetWritingByIdAndDelete(req.query.id, req.body.id, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
};