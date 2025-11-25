const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const controllerFavouriteProduct = require('../controllers/favouriteProduct.controller');

router.post('/add-favourite-product', authUser, asyncHandler(controllerFavouriteProduct.addFavouriteProduct));
router.post('/delete-favourite-product', authUser, asyncHandler(controllerFavouriteProduct.deleteFavouriteProduct));
router.get('/get-favourite-products', authUser, asyncHandler(controllerFavouriteProduct.getFavouriteProducts));

module.exports = router;
