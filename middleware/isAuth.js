const Admin = require('../models/admin/Admin');
const fs = require('fs');

module.exports = (req, res, next) => {
    if (req.session.ADMIN_PASSWORD && req.session.ADMIN_PASSWORD == process.env.ADMIN_PASSWORD)
        return next();

    else if (req.session && req.session.admin)
        Admin.findAdminByIdAndFormat(req.session.admin._id, (err, admin) => {
            if (err) return res.status(401).redirect('/auth/login');;

            req.session.admin = admin;
            console.log('isAuth.js: admin: ', admin);
            return next();
        });

    else {
        if (req.file && req.file.filename) {
            fs.unlink('./public/res/uploads/' + req.file.filename, () => {
                req.session.redirect = req.originalUrl;

                return res.status(401).redirect('/auth/login');
            });
        } else {
            req.session.redirect = req.originalUrl;

            return res.status(401).redirect('/auth/login');
        }
    }
}
