const express = require('express');
const multer = require('multer');
const { uploadFoodImage, uploadRestaurantImage } = require('../utils/cloudinary');
const { supplierAuth, verifyRestaurantOwnership } = require('../middleware/supplierAuth');
const router = express.Router();
const { foodPool } = require('../config/db');

const upload = multer({ dest: 'uploads/' });

const verifyFoodOwnership = async (req, res, next) => {
  try {
    const { foodId } = req.params;
    const userId = req.user.userId;

    const result = await foodPool.query(
      `SELECT f.food_id
       FROM foods f
       JOIN restaurants r ON f.restaurant_id = r.id
       WHERE f.food_id = $1 AND r.owner_id = $2`,
      [foodId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền cập nhật ảnh món ăn này.'
      });
    }

    next();
  } catch (error) {
    console.error('Verify food ownership error:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi xác thực quyền sở hữu món ăn.'
    });
  }
};

/**
 * Upload ảnh món ăn
 * POST /api/food-upload/foods/:foodId
 */
router.post('/foods/:foodId', supplierAuth, verifyFoodOwnership, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { foodId } = req.params;

    if (!file || !foodId) {
      return res.status(400).json({
        success: false,
        message: 'File hoặc food ID không hợp lệ'
      });
    }

    // Upload lên Cloudinary
    const result = await uploadFoodImage(file.path, foodId);
    const imageUrl = result.secure_url;

    // Cập nhật URL ảnh vào database
    await foodPool.query(
      'UPDATE foods SET image_url = $1 WHERE food_id = $2',
      [imageUrl, foodId]
    );

    return res.json({
      success: true,
      message: 'Upload ảnh món ăn thành công',
      url: imageUrl
    });
  } catch (err) {
    console.error('Upload food image error:', err);
    return res.status(500).json({
      success: false,
      message: 'Upload thất bại',
      error: err.message
    });
  }
});

/**
 * Upload ảnh nhà hàng
 * POST /api/food-upload/restaurants/:restaurantId
 */
router.post('/restaurants/:restaurantId', supplierAuth, verifyRestaurantOwnership, upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const { restaurantId } = req.params;

    if (!file || !restaurantId) {
      return res.status(400).json({
        success: false,
        message: 'File hoặc restaurant ID không hợp lệ'
      });
    }

    // Upload lên Cloudinary
    const result = await uploadRestaurantImage(file.path, restaurantId);
    const imageUrl = result.secure_url;

    // Cập nhật URL ảnh vào database
    await foodPool.query(
      'UPDATE restaurants SET image_url = $1 WHERE id = $2',
      [imageUrl, restaurantId]
    );

    return res.json({
      success: true,
      message: 'Upload ảnh nhà hàng thành công',
      url: imageUrl
    });
  } catch (err) {
    console.error('Upload restaurant image error:', err);
    return res.status(500).json({
      success: false,
      message: 'Upload thất bại',
      error: err.message
    });
  }
});

module.exports = router;
