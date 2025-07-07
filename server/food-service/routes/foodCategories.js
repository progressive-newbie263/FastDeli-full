const express = require('express');
const router = express.Router();
const foodCategoryController = require('../controllers/foodCategoryController');

router.get('/', foodCategoryController.getAllCategories);

module.exports = router;
