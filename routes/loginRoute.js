const express = require('express');

const router = express.Router();

const indexGetController = require('../controllers/login/get');

// const indexPostController = require('../controllers/login/post');

router.get(
  '/',
    indexGetController
);

// router.post(
//   '/',
//     indexPostController
// );

module.exports = router;
