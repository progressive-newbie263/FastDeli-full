const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload ảnh món ăn lên Cloudinary
 * Mỗi món ăn có thể có ảnh riêng, được đặt tên theo food_id
 * @param {string} filePath - Đường dẫn file tạm
 * @param {number} foodId - ID của món ăn
 * @returns {Promise} Cloudinary result
 */
const uploadFoodImage = (filePath, foodId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'foods',
        public_id: `food_${foodId}`,
        overwrite: true,
        use_filename: true,
        unique_filename: false,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (err, result) => {
        // Xóa file tạm sau khi upload
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Lỗi khi xoá file tạm:', unlinkErr);
        }

        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Upload ảnh nhà hàng lên Cloudinary
 * @param {string} filePath - Đường dẫn file tạm
 * @param {number} restaurantId - ID của nhà hàng
 * @returns {Promise} Cloudinary result
 */
const uploadRestaurantImage = (filePath, restaurantId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'restaurants',
        public_id: `restaurant_${restaurantId}`,
        overwrite: true,
        use_filename: true,
        unique_filename: false,
        transformation: [
          { width: 1200, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (err, result) => {
        // Xóa file tạm sau khi upload
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Lỗi khi xoá file tạm:', unlinkErr);
        }

        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Upload ảnh coupon lên Cloudinary
 * @param {string} filePath - Đường dẫn file tạm
 * @param {number} couponId - ID của coupon
 * @returns {Promise} Cloudinary result
 */
const uploadCouponImage = (filePath, couponId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'coupons',
        public_id: `coupon_${couponId}`,
        overwrite: true,
        use_filename: true,
        unique_filename: false,
        transformation: [
          { width: 1200, height: 600, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (err, result) => {
        try {
          fs.unlinkSync(filePath);
        } catch (unlinkErr) {
          console.warn('Lỗi khi xoá file tạm:', unlinkErr);
        }

        if (err) return reject(err);
        resolve(result);
      }
    );
  });
};

/**
 * Xóa ảnh trên Cloudinary
 * @param {string} publicId - Public ID của ảnh (e.g., "foods/food_123")
 * @returns {Promise} Cloudinary result
 */
const deleteImage = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

module.exports = {
  uploadFoodImage,
  uploadRestaurantImage,
  uploadCouponImage,
  deleteImage
};
