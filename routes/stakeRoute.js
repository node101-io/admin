const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const editGetController = require('../controllers/stake/edit/get');

const editPostController = require('../controllers/stake/edit/post');
const imagePostController = require('../controllers/stake/image/post');
const statusPostController = require('../controllers/stake/status/post');

router.get(
  '/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    editGetController
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
  '/status',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    statusPostController
);

module.exports = router;
