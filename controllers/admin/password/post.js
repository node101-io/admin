const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  Admin.findAdminByIdAndResetPassword(req.query.id, req.body, err => {
    if (err) {
      res.write(JSON.stringify({ success: false, error: err }));
      return res.end();
    }

    res.write(JSON.stringify({ success: true }));
    return res.end();
  });
};