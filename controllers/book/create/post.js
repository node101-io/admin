const Book = require('../../../models/book/Book');

module.exports = (req, res) => {
  Book.createBook(req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
};