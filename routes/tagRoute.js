const express = require('express');

const router = express.Router();

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const editGetController = require('../controllers/tag/edit/get');
const filterGetController = require('../controllers/tag/filter/get');
const indexGetController = require('../controllers/tag/index/get');

const createPostController = require('../controllers/tag/create/post');
const deletePostController = require('../controllers/tag/delete/post');
const editPostController = require('../controllers/tag/edit/post');
const orderPostController = require('../controllers/tag/order/post');
const translatePostController = require('../controllers/tag/translate/post');

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
router.get(
  '/filter',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    filterGetController
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
  '/order',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    orderPostController
);
router.post(
  '/translate',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    translatePostController
);

module.exports = router;
