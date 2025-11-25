const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/website');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { authAdmin, asyncHandler } = require('../auth/checkAuth');

const controllerWebsite = require('../controllers/website.controller');

router.post('/create', authAdmin, upload.single('banner'), asyncHandler(controllerWebsite.createBanner));
router.post('/delete', authAdmin, asyncHandler(controllerWebsite.deleteBanner));
router.get('/get', asyncHandler(controllerWebsite.getBanner));

module.exports = router;
