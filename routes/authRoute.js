const express = require('express');

const router = express.Router();

const loginGetController = require('../controllers/auth/login/get');
const logoutGetController = require('../controllers/auth/logout/get');

const loginPostController = require('../controllers/auth/login/post');

router.get(
  '/login',
    loginGetController
);
router.get(
  '/logout',
    logoutGetController
);

router.post(
  '/login',
    loginPostController
);

module.exports = router;
