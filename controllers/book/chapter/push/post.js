const Chapter = require('../../../../models/chapter/Chapter');

module.exports = (req, res) => {
  Chapter.findChapterByIdAndCreateChapter(req.query.id, req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
}