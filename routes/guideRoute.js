const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const editGetController = require('../controllers/guide/edit/get');
const indexGetController = require('../controllers/guide/index/get');

const createPostController = require('../controllers/guide/create/post');
const editPostController = require('../controllers/guide/edit/post');
const imagePostController = require('../controllers/guide/image/post');
const orderPostController = require('../controllers/guide/order/post');
const statusPostController = require('../controllers/guide/status/post');
const translatePostController = require('../controllers/guide/translate/post');

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
  '/status',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    statusPostController
);
router.post(
  '/translate',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    translatePostController
);

module.exports = router;
