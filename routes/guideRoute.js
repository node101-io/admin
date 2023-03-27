const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const deleteGetController = require('../controllers/guide/delete/get');
const editGetController = require('../controllers/guide/edit/get');
const indexGetController = require('../controllers/guide/index/get');

const writingIndexGetController = require('../controllers/guide/writing/index/get');

const createPostController = require('../controllers/guide/create/post');
const deletePostController = require('../controllers/guide/delete/post');
const editPostController = require('../controllers/guide/edit/post');
const imagePostController = require('../controllers/guide/image/post');
const orderPostController = require('../controllers/guide/order/post');
const restorePostController = require('../controllers/guide/restore/post');
const statusPostController = require('../controllers/guide/status/post');
const translatePostController = require('../controllers/guide/translate/post');

const writingCoverPostController = require('../controllers/guide/writing/cover/post');
const writingEditPostController = require('../controllers/guide/writing/edit/post');
const writingTranslatePostController = require('../controllers/guide/writing/translate/post');

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
  '/writing',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingIndexGetController
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

router.post(
  '/writing/cover',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingCoverPostController
);
router.post(
  '/writing/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingEditPostController
);
router.post(
  '/writing/translate',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingTranslatePostController
);

module.exports = router;
