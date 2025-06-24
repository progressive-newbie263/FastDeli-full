const { v2: cloudinary } = require('cloudinary');
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/*
  function này giúp ghi đè avatar mới lên cái avatar cũ của người dùng
  Giúp tiết kiệm dung lượng lưu trữ trên Cloudinary
*/
const uploadToCloudinary = (filePath, userId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      {
        folder: 'avatars',
        public_id: `user_${userId}`,
        overwrite: true,
        use_filename: true,
        unique_filename: false            
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


module.exports = { uploadToCloudinary };
