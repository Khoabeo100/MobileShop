const express = require('express');
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require('../auth/checkAuth');

const controllerPreviewProduct = require('../controllers/previewProduct.controller');

router.post('/create', authUser, asyncHandler(controllerPreviewProduct.createPreviewProduct));
router.get('/get', asyncHandler(controllerPreviewProduct.getPreviewProductHome));

module.exports = router;
