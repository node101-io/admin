const Blog = require('../../../../models/blog/Blog');

module.exports = (req, res) => {
  Blog.findBlogByIdAndCreateWriting(req.query.id, req.body, (err, id) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, id }));
    return res.end();
  });
};