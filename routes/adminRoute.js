const express = require('express');

const router = express.Router();

const isSystemAdmin = require('../middleware/isSystemAdmin');

const editGetController = require('../controllers/admin/edit/get');
const indexGetController = require('../controllers/admin/index/get');
const loginGetController = require('../controllers/admin/login/get');
const logoutGetController = require('../controllers/admin/logout/get');

const editPostController = require('../controllers/admin/edit/post');
const createPostController = require('../controllers/admin/create/post');
const loginPostController = require('../controllers/admin/login/post');

router.get(
  '/edit',
    isSystemAdmin,
    editGetController
);
router.get(
  '/',
    isSystemAdmin,
    indexGetController
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
  '/edit',
    isSystemAdmin,
    editPostController
);
router.post(
  '/create',
    isSystemAdmin,
    createPostController
);
router.post(
  '/login',
    loginPostController
);

module.exports = router;
