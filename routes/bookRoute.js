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

const writingContentGetController = require('../controllers/book/writing/content/get');
const writingEditGetController = require('../controllers/book/writing/edit/get');

const createPostController = require('../controllers/book/create/post');
const deletePostController = require('../controllers/book/delete/post');
const editPostController = require('../controllers/book/edit/post');
const imagePostController = require('../controllers/book/image/post');
const orderPostController = require('../controllers/book/order/post');
const restorePostController = require('../controllers/book/restore/post');
const translatePostController = require('../controllers/book/translate/post');

const chapterCreatePostController = require('../controllers/book/chapter/create/post');

const writingCoverPostController = require('../controllers/book/writing/cover/post');
const writingCoverTranslatePostController = require('../controllers/book/writing/cover-translate/post');
const writingCreatePostController = require('../controllers/book/writing/create/post');
const writingEditPostController = require('../controllers/book/writing/edit/post');
const writingLogoPostController = require('../controllers/book/writing/logo/post');
const writingLogoTranslatePostController = require('../controllers/book/writing/logo-translate/post');
const writingRestorePostController = require('../controllers/book/writing/restore/post');
const writingTranslatePostController = require('../controllers/book/writing/translate/post');

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

router.get(
  '/writing/content',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingContentGetController
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
  '/chapter/create',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    chapterCreatePostController
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
  '/writing/cover-translate',
    upload.single('file'),
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingCoverTranslatePostController
);
router.post(
  '/writing/create',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    writingCreatePostController
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
