const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  Blog.findBlogByIdAndGetWritingByIdAndUpdateLogo(req.query.id, req.query.writing_id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};