const express = require('express');

const router = express.Router();

const isAdmin = require('../middleware/isAdmin');

const errorGetController = require('../controllers/index/error/get');
const indexGetController = require('../controllers/index/index/get');

router.get(
  '/',
    isAdmin,
    indexGetController
);
router.get(
  '/error',
    errorGetController
);

module.exports = router;
