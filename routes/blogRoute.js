const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const deleteGetController = require('../controllers/blog/delete/get');
const editGetController = require('../controllers/blog/edit/get');
const indexGetController = require('../controllers/blog/index/get');

const createPostController = require('../controllers/blog/create/post');
const deletePostController = require('../controllers/blog/delete/post');
const editPostController = require('../controllers/blog/edit/post');
const imagePostController = require('../controllers/blog/image/post');
const orderPostController = require('../controllers/blog/order/post');
const restorePostController = require('../controllers/blog/restore/post');
const translatePostController = require('../controllers/blog/translate/post');

router.get(
  '/',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    indexGetController
);
router.get(
  '/delete',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    deleteGetController
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
  '/delete',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    deletePostController
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
  '/translate',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    translatePostController
);

module.exports = router;
