const express = require('express');

const router = express.Router();

const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

const errorGetController = require('../controllers/index/error/get');
const indexGetController = require('../controllers/index/index/get');
const writingGetController = require('../controllers/index/writing/get');

router.get(
  '/',
    isAdmin,
    createNavbarData,
    indexGetController
);
router.get(
  '/error',
    errorGetController
);
router.get(
  '/writing',
    isAdmin,
    createNavbarData,
    writingGetController
);

module.exports = router;
