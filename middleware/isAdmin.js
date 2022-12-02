const Admin = require('../models/admin/Admin');

module.exports = (req, res, next) => {
  if (req.session && req.session.admin) {
    Admin.findAdminByIdAndFormat(req.session.admin._id, (err, admin) => {
      if (err) return res.status(401).redirect('/login');;
      
      req.session.admin = admin;
      return next();
    });
  } else {
    if (req.file && req.file.filename) {
      fs.unlink('./public/res/uploads/' + req.file.filename, () => {
        req.session.redirect = req.originalUrl;

        return res.status(401).redirect('/login');
      });
    } else {
      req.session.redirect = req.originalUrl;

      return res.status(401).redirect('/login');
    }
  };
};
