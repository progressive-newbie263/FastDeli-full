const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file received' });
    }

    console.log('File received:', req.file);
    console.log('Folder:', req.body.folder);

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: req.body.folder || 'general'
    });

    fs.unlinkSync(req.file.path);

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
});

module.exports = router;
