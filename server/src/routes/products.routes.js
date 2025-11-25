const express = require('express');
const router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'src/uploads/products');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

var upload = multer({ storage: storage });

const { asyncHandler } = require('../auth/checkAuth');

const controllerProducts = require('../controllers/products.controller');

router.post('/create', asyncHandler(controllerProducts.createProduct));
router.post('/uploads', upload.array('images'), asyncHandler(controllerProducts.uploadsImage));
router.get('/product', asyncHandler(controllerProducts.getProductById));
router.get('/search', asyncHandler(controllerProducts.searchProduct));
router.post('/update', asyncHandler(controllerProducts.updateProduct));
router.post('/delete', asyncHandler(controllerProducts.deleteProduct));

router.get('/all', asyncHandler(controllerProducts.getAllProducts));
router.get('/flash-sale', asyncHandler(controllerProducts.getProductFlashSale));
router.get('/category', asyncHandler(controllerProducts.getProductByCategory));

module.exports = router;
