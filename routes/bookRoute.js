const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const deleteGetController = require('../controllers/book/delete/get');
const editGetController = require('../controllers/book/edit/get');
const indexGetController = require('../controllers/book/index/get');

const chapterIndexGetController = require('../controllers/book/chapter/index/get');

const createPostController = require('../controllers/book/create/post');
const deletePostController = require('../controllers/book/delete/post');
const editPostController = require('../controllers/book/edit/post');
const imagePostController = require('../controllers/book/image/post');
const orderPostController = require('../controllers/book/order/post');
const restorePostController = require('../controllers/book/restore/post');
const translatePostController = require('../controllers/book/translate/post');

const chapterCreatePostController = require('../controllers/book/chapter/create/post');

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

router.get(
  '/chapter',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    chapterIndexGetController
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

router.post(
  '/chapter/create',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    chapterCreatePostController
);

module.exports = router;
