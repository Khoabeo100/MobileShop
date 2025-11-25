const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const controllerCoupon = require('../controllers/counpon.controller');

router.post('/create', asyncHandler(controllerCoupon.createCoupon));
router.get('/get-all-coupon', asyncHandler(controllerCoupon.getAllCoupon));
router.post('/update', asyncHandler(controllerCoupon.updateCoupon));
router.post('/delete', asyncHandler(controllerCoupon.deleteCoupon));
router.post('/add-coupon-to-cart', authUser, asyncHandler(controllerCoupon.addCouponToCart));

module.exports = router;
