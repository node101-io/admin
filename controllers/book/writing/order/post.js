const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndGetWritingByIdAndIncOrderByOne(req.query.id, req.body.id, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndGetWritingByIdAndIncOrderByOne(req.query.id, req.body.id, err => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true }));
      return res.end();
    });
};