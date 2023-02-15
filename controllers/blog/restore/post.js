const Blog = require('../../../models/blog/Blog');

module.exports = (req, res) => {
  Blog.findBlogByIdAndRestore(req.body.id, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};