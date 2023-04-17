const express = require('express');
const multer = require('multer');

const router = express.Router();

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const getController = require('../controllers/wizard/get');

const postController = require('../controllers/wizard/post');

router.get(
  '/',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    getController
);

router.post(
  '/edit',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    postController
);

module.exports = router;