const express = require('express');
const router = express.Router();
const PromotionController = require('../controllers/promotionController');
// const auth = require('../middleware/auth');
// const { validatePromotion } = require('../middleware/validation');

// Public routes
router.get('/', PromotionController.getAllPromotions);
router.get('/:id', PromotionController.getPromotionById);

// Protected routes (cần auth, ví dụ như quản trị viên / nhà hàng mới được phép thêm sửa xóa)
router.post('/', /*auth, validatePromotion,*/ PromotionController.createPromotion);
router.put('/:id', /*auth, validatePromotion,*/ PromotionController.updatePromotion);
router.delete('/:id', /*auth,*/ PromotionController.deletePromotion);

module.exports = router;
