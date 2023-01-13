const express = require('express');

const router = express.Router();

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const deleteGetController = require('../controllers/writer/delete/get');
const editGetController = require('../controllers/writer/edit/get');
const indexGetController = require('../controllers/writer/index/get');

const createPostController = require('../controllers/writer/create/post');
const deletePostController = require('../controllers/writer/delete/post');
const editPostController = require('../controllers/writer/edit/post');
const imagePostController = require('../controllers/writer/image/post');

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
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    imagePostController
);

module.exports = router;
