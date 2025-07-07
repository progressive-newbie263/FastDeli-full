const express = require('express');
const multer = require('multer');
const { uploadToCloudinary } = require('../utils/cloudinary');
const router = express.Router();
const pool = require('../config/db'); // database connection để lưu URL ảnh

const upload = multer({ dest: 'uploads/' });

// người dùng (khách hàng)
// API upload avatar và lưu vào Cloudinary: /avatars/customers/user_{id}.jpg
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const file = req.file;
    const userId = req.body.user_id;

    //console.log('Received file:', file);
    //console.log('Received user_id:', userId);

    if (!file || !userId) {
      return res.status(400).json({ success: false, message: 'File or user ID missing' });
    }

    const result = await uploadToCloudinary(file.path, userId);
    const imageUrl = result.secure_url;

    await pool.query(
      'UPDATE users SET avatar_url = $1 WHERE user_id = $2',
      [imageUrl, userId]
    );

    return res.json({ success: true, url: imageUrl });
  } catch (err) {
    console.error('❌ Upload error:', err);
    return res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
