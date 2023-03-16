const express = require('express');

const router = express.Router();

const isAPIAuthenticated = require('../middleware/isAPIAuthenticated');

const projectsGetController = require('../controllers/api/projects/get');

const authenticatePostController = require('../controllers/api/authenticate/post');

router.get(
  '/projects',
    isAPIAuthenticated,
    projectsGetController
);

router.post(
  '/authenticate',
    authenticatePostController
);

module.exports = router;
