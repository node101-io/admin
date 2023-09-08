const express = require('express');
const multer = require('multer');

const router = express.Router();
const upload = multer({ dest: './public/res/uploads/' });

const checkAdminPermission = require('../middleware/checkAdminPermission');
const createNavbarData = require('../middleware/createNavbarData');
const isAdmin = require('../middleware/isAdmin');

// const deleteGetController = require('../controllers/event/delete/get');
// const editGetController = require('../controllers/event/edit/get');
// const filterGetController = require('../controllers/event/filter/get');
// const indexGetController = require('../controllers/event/index/get');

const createPostController = require('../controllers/venue/create/post');
const deletePostController = require('../controllers/venue/delete/post');
// const editPostController = require('../controllers/event/edit/post');
const imagePostController = require('../controllers/venue/image/post');
const orderPostController = require('../controllers/venue/order/post');
const restorePostController = require('../controllers/venue/restore/post');
// const translatePostController = require('../controllers/event/translate/post');

// router.get(
//   '/',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     indexGetController
// );
// router.get(
//   '/delete',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     deleteGetController
// );
// router.get(
//   '/edit',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     editGetController
// );
// router.get(
//   '/filter',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     filterGetController
// );

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
// router.post(
//   '/edit',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     editPostController
// );
router.post(
  '/image',
    upload.single('file'),
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
router.post(
  '/restore',
    isAdmin,
    checkAdminPermission,
    createNavbarData,
    restorePostController
);
// router.post(
//   '/translate',
//     isAdmin,
//     checkAdminPermission,
//     createNavbarData,
//     translatePostController
// );

module.exports = router;