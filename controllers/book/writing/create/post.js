const Book = require('../../../../models/book/Book');
const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  if (!req.query.type || req.query.type != 'chapter')
    Book.findBookByIdAndCreateWriting(req.query.id, req.body, (err, id) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, id }));
      return res.end();
    });
  else
    Chapter.findChapterByIdAndCreateWriting(req.query.id, req.body, (err, id) => {
      if (err) {
        res.write(JSON.stringify({ success: false, error: err }));
        return res.end();
      }

      res.write(JSON.stringify({ success: true, id }));
      return res.end();
    });
};