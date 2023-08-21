const express = require('express');
const multer = require('multer');

const router = express.Router();

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const filterGetController = require('../controllers/event/filter/get');

const createPostController = require('../controllers/event/create/post');
const deletePostController = require('../controllers/event/delete/post');
const editPostController = require('../controllers/event/edit/post');
const orderPostController = require('../controllers/event/order/post');
const restorePostController = require('../controllers/event/restore/post');
const translatePostController = require('../controllers/event/translate/post');

router.get(
  '/filter',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    filterGetController
);

router.post(
  '/create',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    createPostController
);
router.post(
  '/delete',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    deletePostController
);
router.post(
  '/edit',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    editPostController
);
router.post(
  '/order',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    orderPostController
);
router.post(
  '/restore',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    restorePostController
);
router.post(
  '/translate',
    // isAdmin,
    // checkAdminPermission,
    // createNavbarData,
    translatePostController
);

module.exports = router;