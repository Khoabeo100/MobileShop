const express = require('express');
const router = express.Router();

const controllerCategory = require('../controllers/category.controller');

const { authUser, asyncHandler } = require('../auth/checkAuth');

router.post('/create', asyncHandler(controllerCategory.createCategory));
router.get('/gets', asyncHandler(controllerCategory.getCategories));
router.post('/update', asyncHandler(controllerCategory.updateCategory));
router.post('/delete', asyncHandler(controllerCategory.deleteCategory));

module.exports = router;
