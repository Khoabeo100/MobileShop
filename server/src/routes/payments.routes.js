const express = require('express');
const router = express.Router();

const controllerPayments = require('../controllers/payments.controller');

const { authUser } = require('../auth/checkAuth');

router.post('/create', authUser, controllerPayments.createPayment);
router.get('/momo', controllerPayments.momoCallback);
router.get('/vnpay', controllerPayments.vnpayCallback);
router.get('/payment', controllerPayments.getPaymentById);
router.get('/payments', authUser, controllerPayments.getPaymentsByUserId);
router.post('/cancel', authUser, controllerPayments.cancelPayment);
router.get('/payments-admin', controllerPayments.getPayments);
router.post('/update-status', controllerPayments.updateStatus);

module.exports = router;
