const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/categoryController');

// ✅ THÊM MỚI: Middleware cache headers (lâu hơn vì categories ít thay đổi)
const addCacheHeaders = (req, res, next) => {
  // Cache 30 phút (1800 giây)
  res.set('Cache-Control', 'public, max-age=1800, s-maxage=1800');
  res.set('Vary', 'Accept-Encoding');
  next();
};

// ✅ SỬA: Thêm addCacheHeaders vào các routes
router.get('/', addCacheHeaders, CategoryController.getAllCategories);
router.get('/:id', addCacheHeaders, CategoryController.getCategoryById);

module.exports = router;