const express = require('express');

const router = express.Router();

const isAPIAuthenticated = require('../middleware/isAPIAuthenticated');

const projectsGetController = require('../controllers/api/projects/get');
const wizardGetController = require('../controllers/api/wizard/get');

const authenticatePostController = require('../controllers/api/authenticate/post');

router.get(
  '/projects',
    // isAPIAuthenticated,
    projectsGetController
);
router.get(
  '/wizard',
    wizardGetController
);

router.post(
  '/authenticate',
    authenticatePostController
);

module.exports = router;
