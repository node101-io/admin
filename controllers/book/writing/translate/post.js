const Book = require('../../../../models/book/Book');

module.exports = (req, res) => {
  Book.findBookByIdAndGetWritingByIdAndUpdateTranslations(req.query.id, req.query.writing_id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};