const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  Chapter.createChapter({
    book_id: req.query.book_id,
    title: req.body.title
  }, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
}