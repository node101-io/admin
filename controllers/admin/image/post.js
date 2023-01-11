const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  Admin.findAdminByIdAndUpdateImage(req.query.id, req.file, (err, url) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, url }));
    return res.end();
  });
};