const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const isAdmin = require('../middleware/isAdmin');

const imagePostController = require('../controllers/writing/image/post');

router.post(
  '/image',
    upload.single('file'),
    isAdmin,
    imagePostController
);

module.exports = router;
