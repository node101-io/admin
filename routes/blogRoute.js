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

const writingContentGetController = require('../controllers/blog/writing/content/get');
const writingDeleteGetController = require('../controllers/blog/writing/delete/get');
const writingEditGetController = require('../controllers/blog/writing/edit/get');
const writingIndexGetController = require('../controllers/blog/writing/index/get');

const createPostController = require('../controllers/blog/create/post');
const deletePostController = require('../controllers/blog/delete/post');
const editPostController = require('../controllers/blog/edit/post');
const imagePostController = require('../controllers/blog/image/post');
const orderPostController = require('../controllers/blog/order/post');
const restorePostController = require('../controllers/blog/restore/post');
const translatePostController = require('../controllers/blog/translate/post');

const writingCoverPostController = require('../controllers/blog/writing/cover/post');
const writingCreatePostController = require('../controllers/blog/writing/create/post');
const writingDeletePostController = require('../controllers/blog/writing/delete/post');
const writingEditPostController = require('../controllers/blog/writing/edit/post');
const writingLogoPostController = require('../controllers/blog/writing/logo/post');
const writingLogoTranslatePostController = require('../controllers/blog/writing/logo-translate/post');
const writingOrderPostController = require('../controllers/blog/writing/order/post');
const writingRestorePostController = require('../controllers/blog/writing/restore/post');
const writingTranslatePostController = require('../controllers/blog/writing/translate/post');

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
router.get(
  '/writing/content',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingContentGetController
);
router.get(
  '/writing/delete',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingDeleteGetController
);
router.get(
  '/writing/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingEditGetController
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
  '/writing/cover',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingCoverPostController
);
router.post(
  '/writing/create',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingCreatePostController
);
router.post(
  '/writing/delete',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingDeletePostController
);
router.post(
  '/writing/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingEditPostController
);
router.post(
  '/writing/logo',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingLogoPostController
);
router.post(
  '/writing/logo-translate',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingLogoTranslatePostController
);
router.post(
  '/writing/order',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingOrderPostController
);
router.post(
  '/writing/restore',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingRestorePostController
);
router.post(
  '/writing/translate',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingTranslatePostController
);

module.exports = router;
