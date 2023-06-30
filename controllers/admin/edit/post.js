const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  Admin.findAdminByIdAndUpdate(req.query.id, req.body, (err, admin) => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true, admin }));
    return res.end();
  });
};