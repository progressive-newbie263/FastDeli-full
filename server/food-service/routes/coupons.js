const express = require('express');
const router = express.Router();
const CouponController = require('../controllers/couponController');

router.get('/', CouponController.getAvailableCoupons);
router.post('/validate', CouponController.validateCoupon);

module.exports = router;
