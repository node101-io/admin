const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  Blog.findBlogByIdAndGetWritingByIdAndRestore(req.query.id, req.blog.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};