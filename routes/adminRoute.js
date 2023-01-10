const express = require('express');

const router = express.Router();

const isSystemAdmin = require('../middleware/isSystemAdmin');

const loginGetController = require('../controllers/admin/login/get');
const logoutGetController = require('../controllers/admin/logout/get');

const loginPostController = require('../controllers/admin/login/post');

router.get(
  '/',
    isSystemAdmin
);
router.get(
  '/login',
    loginGetController
);
router.get(
  '/logout',
    isSystemAdmin,
    logoutGetController
);

router.post(
  '/login',
    loginPostController
);

module.exports = router;
