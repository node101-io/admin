const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const editGetController = require('../controllers/stake/edit/get');
const indexGetController = require('../controllers/stake/index/get');

const createPostController = require('../controllers/stake/create/post');
const editPostController = require('../controllers/stake/edit/post');
const imagePostController = require('../controllers/stake/image/post');
const orderPostController = require('../controllers/stake/order/post');
const restorePostController = require('../controllers/stake/restore/post');
const statusPostController = require('../controllers/stake/status/post');

router.get(
  '/',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    indexGetController
);
router.get(
  '/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    editGetController
);

router.post(
  '/create',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    createPostController
);
router.post(
  '/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    editPostController
);
router.post(
  '/image',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    imagePostController
);
router.post(
  '/order',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    orderPostController
);
router.post(
  '/restore',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    restorePostController
);
router.post(
  '/status',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    statusPostController
);

module.exports = router;
