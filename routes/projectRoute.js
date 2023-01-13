const express = require('express');

const router = express.Router();

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const deleteGetController = require('../controllers/project/delete/get');
const editGetController = require('../controllers/project/edit/get');
const indexGetController = require('../controllers/project/index/get');

const createPostController = require('../controllers/project/create/post');
const deletePostController = require('../controllers/project/delete/post');
const editPostController = require('../controllers/project/edit/post');
const imagePostController = require('../controllers/project/image/post');
const orderPostController = require('../controllers/project/order/post');

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

module.exports = router;
