const Book = require('../../../models/book/Book');

module.exports = (req, res) => {
  Book.findBookByIdAndRestore(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};