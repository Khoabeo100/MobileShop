const express = require('express');
const router = express.Router();

const { asyncHandler, authUser } = require('../auth/checkAuth');

const controllerNotication = require('../controllers/notication.controller');

router.get('/notication', asyncHandler(controllerNotication.getNotication));
router.get('/notication-user', authUser, asyncHandler(controllerNotication.getNoticationByUserId));
router.get('/read-all-notication', authUser, asyncHandler(controllerNotication.readAllNotication));

module.exports = router;
