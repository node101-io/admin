const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const isSystemAdmin = require('../middleware/isSystemAdmin');

const editGetController = require('../controllers/admin/edit/get');
const indexGetController = require('../controllers/admin/index/get');
const loginGetController = require('../controllers/admin/login/get');
const logoutGetController = require('../controllers/admin/logout/get');

const deletePostController = require('../controllers/admin/delete/post');
const editPostController = require('../controllers/admin/edit/post');
const createPostController = require('../controllers/admin/create/post');
const imagePostController = require('../controllers/admin/image/post');
const loginPostController = require('../controllers/admin/login/post');
const passwordPostController = require('../controllers/admin/password/post');

router.get(
  '/',
    isSystemAdmin,
    indexGetController
);
router.get(
  '/edit',
    isSystemAdmin,
    editGetController
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
  '/delete',
    isSystemAdmin,
    deletePostController
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
  '/image',
    upload.single('file'),
    isSystemAdmin,
    imagePostController
);
router.post(
  '/login',
    loginPostController
);
router.post(
  '/password',
    isSystemAdmin,
    passwordPostController
);

module.exports = router;
