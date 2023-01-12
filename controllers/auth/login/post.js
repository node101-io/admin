const Admin = require('../../../models/admin/Admin');

module.exports = (req, res) => {
  Admin.findAdminByEmailAndVerifyPassword(req.body, (err, admin) => {
    if (err) {
      res.write(JSON.stringify({ error: err, success: false }));
      return res.end();
    }

    Admin.findAdminByIdAndFormat(admin._id, (err, admin) => {
      if (err) {
        res.write(JSON.stringify({ error: err, success: false }));
        return res.end();
      }

      req.session.admin = admin;

      res.write(JSON.stringify({ redirect: req.session.redirect, success: true }));
      return res.end();
    });
  });
}